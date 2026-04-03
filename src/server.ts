import { createServer } from "node:http";
import { createNodeMiddleware, Webhooks } from "@octokit/webhooks";
import { SmeeClient } from "smee-client";
import { ConfigCommand } from "./commands/config/config.command.js";
import { PipelineCommand } from "./commands/pipeline/pipeline.command.js";
import { ConfigManager } from "./utils/configManager.utils.js";

export class Server {
    private static instance: Server;
    private webhooks: Webhooks;
    private configCommand: ConfigCommand;
    private pipelineCommand: PipelineCommand;
    private smee: SmeeClient;
    private configManager: ConfigManager
    private constructor() {
        this.configManager = ConfigManager.getInstance();
        this.configCommand = new ConfigCommand();
        this.pipelineCommand = new PipelineCommand();

        this.webhooks = new Webhooks({
            secret: this.configManager.getConfig().server.secret || '',
        });

        if (this.configManager.getConfig().server.local && this.configManager.getConfig().server.proxy !== "") {
            this.smee = new SmeeClient({
                source: this.configManager.getConfig().server.proxy || '',
                target: `http://localhost:${this.configManager.getConfig().server.port}/webhooks`,
                logger: console,
            });
        } else {
            throw new Error("⚠️  Local server is enabled but no proxy URL is configured. Please set the proxy URL from https://smee.io to receive webhooks from GitHub.")
        }

        this.registerHandlers();
    }

    public static getInstance(): Server {
        if (!Server.instance) {
            Server.instance = new Server();
        }
        return Server.instance;
    }

    private registerHandlers() {
        this.webhooks.on("push", async ({ payload }) => {
            console.log(
                `Push event: ${payload.repository.full_name} → ${payload.ref}`
            );

            console.log(`Received a push event for ${payload.repository.full_name} to ${payload.ref}`);
            const signature = await this.webhooks.sign(JSON.stringify(payload))
            const isValid = await this.webhooks.verify(JSON.stringify(payload), signature)
            if (!isValid) {
                console.error("Invalid signature. Possible security threat.")
                return
            }
            console.log("payload", payload?.repository?.full_name, payload?.ref)

            const config = this.configCommand.loadConfig();
            const repoConfig = this.configCommand.findRepoConfig(payload, config);
            console.log("Repo config found:", repoConfig ? "Yes" : "No");
            console.log("Repo config details:", repoConfig);

            if (!repoConfig) return;

            await this.pipelineCommand.runPipeline(repoConfig);
        });
    }

    public start() {
        this.configManager.startWatching();
        const config = this.configManager.getConfig();
        const middleware = createNodeMiddleware(this.webhooks, {
            path: "/webhooks",
        });

        createServer(async (req, res) => {
            if (await middleware(req, res)) return;
            res.writeHead(404).end("Not Found");
        }).listen(config.server.port, () => {
            console.log(`Server running on ${config.server.port}`);
        });

        if (this.configManager.getConfig().server.local && this.configManager.getConfig().server.proxy !== "") {
            this.smee.start();
        }

    }
}