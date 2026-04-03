#!/usr/bin/env node

import { ConfigCommand } from "../commands/config/config.command.js";
import { PipelineCommand } from "../commands/pipeline/pipeline.command.js";
import { ServerCommand } from "../commands/server/server.command.js";
import { Server } from "../server.js";

export class JarvisCLI {
    private static instance: JarvisCLI;
    private configCommand: ConfigCommand
    private serverCommand: ServerCommand
    private PipelineCommand: PipelineCommand
    private constructor() {
        this.configCommand = new ConfigCommand()
        this.serverCommand = new ServerCommand()
        this.PipelineCommand = new PipelineCommand()
    }

    public static getInstance(): JarvisCLI {
        if (!JarvisCLI.instance) {
            JarvisCLI.instance = new JarvisCLI();
        }
        return JarvisCLI.instance;
    }

    public async run(): Promise<void> {
        const [, , command, subcommand, pipelineName] = process.argv;

        switch (command) {
            case 'config':
                await this.handleConfig(subcommand);
                break;
            case 'pipeline':
                await this.handlePipeline(subcommand, pipelineName);
                break;
            case 'start':
                Server.getInstance().start();
                break;
            default:
                this.showHelp();
                break;
        }
    }

    private async handleConfig(subcommand: string | undefined): Promise<void> {
        switch (subcommand) {
            case 'add':
                this.configCommand.run()
                break;
            case 'port':
                this.serverCommand.changePort()
                break;
            case 'local':
                this.serverCommand.changeLocal()
                break;
            case 'proxy':
                this.serverCommand.changeProxy()
                break;
            default:
                this.showHelp();
                break;
        }
    }

    private async handlePipeline(subcommand: string | undefined, pipelineName: string | undefined): Promise<void> {
        if (!pipelineName || pipelineName === "") {
            console.error("❌ Please provide a valid pipeline name.");
            return;
        }
        switch (subcommand) {
            case 'edit':
                this.PipelineCommand.editPipeline(pipelineName)
                break;
            case 'list':
                this.PipelineCommand.listPipelines()

                break;
            case 'delete':
                this.PipelineCommand.deletePipeline(pipelineName)

                break;
            default:
                this.showHelp();
                break;
        }
    }


    private showHelp(): void {
        console.log(`
Jarvis CLI

Commands:
  jarvis config add         Add repository configuration
  jarvis config port        Set webhook server port
  jarvis config local       Set webhook server to listen on localhost(yes) or public ip enabled server (no)
  jarvis config proxy       Set webhook server to listen on interfaces (proxy mode) from smee.io
  jarvis start              Start webhook server
  jarvis pipeline list      List all pipelines
  jarvis pipeline delete <pipelineName>   Delete a pipeline configuration
  jarvis pipeline edit <pipelineName>      Edit an existing pipeline configuration
        `);
    }
}

// 3. Execute the singleton
JarvisCLI.getInstance().run().catch(err => {
    console.error("CLI Error:", err);
    process.exit(1);
});
