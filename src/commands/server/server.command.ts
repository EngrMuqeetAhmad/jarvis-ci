import path from "node:path";
import { ConfigService } from "../config/config.service.js";
import fs from 'fs'
import { AppConfig } from "../../../dist/index.js";

export class ServerCommand {

    private CONFIG_PATH = path.join(process.cwd(), 'configs', '.jarvis-ci.json');
    private configService: ConfigService
    constructor() {
        this.configService = new ConfigService()
    }

    private loadConfigFile(): AppConfig {
        const configFile = fs.readFileSync(this.CONFIG_PATH)
        return JSON.parse(configFile.toString())
    }
    private saveConfigFile(config: AppConfig): void {
        fs.writeFileSync(this.CONFIG_PATH, JSON.stringify(config, null, 2))
    }

    public async changePort() {
        const { portNumber } = await this.configService.getPortNumber()
        const configArray = this.loadConfigFile()
        configArray.server.port = portNumber
        this.saveConfigFile(configArray)
        console.log('✅ Port number has been updated successfully in .jarvis-ci.json');
    }

    public async changeLocal() {
        const { local } = await this.configService.askForLocalorRemote()
        const configArray = this.loadConfigFile()
        configArray.server.local = local
        this.saveConfigFile(configArray)
        console.log(`✅ The server has been configured for local: ${local} number has been updated successfully in .jarvis-ci.json`);
    }

    public async changeProxy() {
        const configArray = this.loadConfigFile()
        if (!configArray.server.local) {
            console.error("❌ Proxy can only be configured when local is set to true.");
            return;
        }
        const { proxy } = await this.configService.getProxyURL()

        configArray.server.proxy = proxy
        this.saveConfigFile(configArray)
        console.log(`✅ Proxy URL has been updated successfully in .jarvis-ci.json`);
    }

}