import fs from 'fs';
import path from 'path';
import { ConfigService } from './config.service.js';
export class ConfigCommand {
    CONFIG_PATH = path.join(process.cwd(), 'configs', '.jarvis-ci.json');
    configService;
    constructor() {
        this.configService = new ConfigService();
    }
    async run() {
        const { local } = await this.configService.askForLocalorRemote();
        const proxyURL = local ? (await this.configService.getProxyURL()).proxy : '';
        const { githubRepoURL } = await this.configService.getGithubRepo();
        const { branchName } = await this.configService.getBranchName();
        const { webhookSecret } = await this.configService.getWebhookSecret();
        const { pipelineName } = await this.configService.getPipelineName();
        const tempDirPath = this.configService.createTempPipelineDirectory(githubRepoURL);
        if (!tempDirPath) {
            console.error('Failed to create temporary pipeline directory.');
            process.exit(1);
        }
        const pipelineFilePath = await this.configService.openPipelineFileEditor(pipelineName);
        if (!pipelineFilePath) {
            console.error('Failed to create pipeline file.');
            process.exit(1);
        }
        const config = {
            name: pipelineName,
            repo: githubRepoURL,
            branch: branchName,
            secret: webhookSecret,
            yamlPath: pipelineFilePath,
            tempDir: tempDirPath
        };
        const configFile = fs.readFileSync(this.CONFIG_PATH);
        let configArray = JSON.parse(configFile.toString());
        configArray.server.local = local;
        if (local) {
            configArray.server.proxy = proxyURL;
        }
        configArray.repos.push(config);
        fs.writeFileSync(this.CONFIG_PATH, JSON.stringify(configArray, null, 2));
        console.log('✅ configuration has been added successfully to .jarvis-ci.json');
    }
    loadConfig() {
        const file = fs.readFileSync(this.CONFIG_PATH);
        return JSON.parse(file.toString());
    }
    findRepoConfig(payload, config) {
        return (config.repos.find((repo) => repo.repo.toLowerCase() ===
            payload.repository.full_name.toLowerCase() &&
            repo.branch === payload.ref.replace("refs/heads/", "")) || null);
    }
}
