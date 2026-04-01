import path from "node:path";
import fs from 'fs';
import { ConfigService } from "../config/config.service.js";
import YAML from 'yaml';
import { execa } from "execa";
import { Listr } from "listr2";
import { Logger } from "../../utils/logger.utils.js";
export class PipelineCommand {
    ALLOWED_COMMANDS = [
        "node",
        "npm",
        "docker",
        "docker-compose",
        "ssh",
        "git",
    ];
    configService;
    CONFIG_PATH = path.join(process.cwd(), 'configs', '.jarvis-ci.json');
    constructor() {
        this.configService = new ConfigService();
    }
    listPipelines() {
        const configFile = fs.readFileSync(this.CONFIG_PATH);
        let configArray = JSON.parse(configFile.toString());
        const pipelines = configArray.repos.map((repo) => repo.name);
        console.log('Pipelines:');
        pipelines.forEach((pipeline) => {
            console.log(`- ${pipeline}`);
        });
    }
    editPipeline(pipelineName) {
        console.log(`Editing pipeline: ${pipelineName}`);
        const path = this.configService.openPipelineFileEditor(pipelineName);
        console.log('Pipeline has been updated at:', path);
    }
    deletePipeline(pipelineName) {
        console.log(`Deleting pipeline: ${pipelineName}`);
        const configFile = fs.readFileSync(this.CONFIG_PATH);
        let configArray = JSON.parse(configFile.toString());
        const newConfigFile = configArray.repos.filter((repo) => repo.name !== pipelineName);
        configArray.repos = newConfigFile;
        fs.writeFileSync(this.CONFIG_PATH, JSON.stringify(configArray, null, 2));
        console.log(`Pipeline "${pipelineName}" has been deleted from configuration.`);
    }
    async runPipeline(repoConfig) {
        const logger = new Logger(repoConfig.tempDir);
        try {
            logger.log("🚀 Running pipeline");
            const pipeline = this.loadYAML(repoConfig.yamlPath);
            this.validatePipeline(pipeline);
            const tasks = this.createTasks(pipeline, repoConfig.tempDir);
            await tasks.run();
            logger.log("✅ Pipeline finished");
        }
        catch (err) {
            logger.log("❌ Pipeline failed:", err.message);
        }
        finally {
            logger.close();
        }
    }
    loadYAML(path) {
        const file = fs.readFileSync(path);
        return YAML.parse(file.toString());
    }
    validatePipeline(config) {
        if (!config.steps)
            throw new Error("Invalid pipeline");
        for (const step of config.steps) {
            if (!this.ALLOWED_COMMANDS.includes(step.run.cmd)) {
                throw new Error(`Command not allowed: ${step.run.cmd}`);
            }
        }
    }
    createTasks(config, cwd) {
        return new Listr(config.steps.map((step) => ({
            title: step.name,
            task: async () => {
                await execa(step.run.cmd, step.run.args, {
                    cwd,
                    stdio: "inherit",
                });
            },
        })));
    }
}
