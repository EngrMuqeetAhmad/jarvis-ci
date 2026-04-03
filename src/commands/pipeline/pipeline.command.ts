import path from "node:path";
import fs from 'fs'
import { ConfigService } from "../config/config.service.js";
import { AppConfig, PipelineConfig, RepoConfig, Step } from "../../../dist/index.js";
import YAML from 'yaml'
import { execa } from "execa";
import { Listr } from "listr2";
import { Logger } from "../../utils/logger.utils.js";

export class PipelineCommand {
    private ALLOWED_COMMANDS = [
        "node",
        "npm",
        "docker",
        "docker-compose",
        "ssh",
        "git",
    ];
    private configService: ConfigService
    private CONFIG_PATH = path.join(process.cwd(), 'configs', '.jarvis-ci.json');
    constructor() {
        this.configService = new ConfigService()
    }

    listPipelines() {
        const configFile = fs.readFileSync(this.CONFIG_PATH)
        let configArray = JSON.parse(configFile.toString())
        const pipelines = configArray.repos.map((repo: any) => repo.name)
        console.log('Pipelines:');
        pipelines.forEach((pipeline: string) => {
            console.log(`- ${pipeline}`);
        });
    }

    editPipeline(pipelineName: string) {
        console.log(`Editing pipeline: ${pipelineName}`);
        const path = this.configService.openPipelineFileEditor(pipelineName)
        console.log('Pipeline has been updated at:', path);
    }


    deletePipeline(pipelineName: string) {
        console.log(`Deleting pipeline: ${pipelineName}`);
        const configFile = fs.readFileSync(this.CONFIG_PATH)
        let configArray: AppConfig = JSON.parse(configFile.toString())
        const newConfigFile = configArray.repos.filter((repo: any) => repo.name !== pipelineName)

        configArray.repos = newConfigFile

        fs.writeFileSync(this.CONFIG_PATH, JSON.stringify(configArray, null, 2))
        console.log(`Pipeline "${pipelineName}" has been deleted from configuration.`);
    }

    async runPipeline(repoConfig: RepoConfig) {
        const logger = new Logger(repoConfig.tempDir);

        try {
            logger.log("🚀 Running pipeline");

            const pipeline = this.loadYAML(repoConfig.yamlPath);
            this.validatePipeline(pipeline);

            const tasks = this.createTasks(pipeline, repoConfig.tempDir);

            await tasks.run();

            logger.log("✅ Pipeline finished");
        } catch (err: any) {
            logger.log("❌ Pipeline failed:", err.message);
        } finally {
            logger.close();
        }
    }

    private loadYAML(path: string): PipelineConfig {
        const file = fs.readFileSync(path);
        return YAML.parse(file.toString());
    }

    private validatePipeline(config: PipelineConfig) {
        if (!config.steps) throw new Error("Invalid pipeline");

        for (const step of config.steps) {
            if (!this.ALLOWED_COMMANDS.includes(step.run.cmd)) {
                throw new Error(`Command not allowed: ${step.run.cmd}`);
            }
        }
    }

    private createTasks(config: PipelineConfig, cwd: string) {
        return new Listr(
            config.steps.map((step: Step) => ({
                title: step.name,
                task: async () => {
                    await execa(step.run.cmd, step.run.args, {
                        cwd,
                        stdio: "inherit",
                    });
                },
            }))
        );
    }

}