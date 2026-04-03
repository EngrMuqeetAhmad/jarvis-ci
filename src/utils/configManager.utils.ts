import fs from "fs";
import path from "node:path";
import { AppConfig } from "../../dist/index.js";

export class ConfigManager {
    private static instance: ConfigManager;
    private config: AppConfig;
    private CONFIG_PATH = path.join(
        process.cwd(),
        "configs",
        ".jarvis-ci.json"
    );

    private constructor() {
        this.config = this.loadConfig();
        // this.watch();
    }
    public startWatching() {
        this.watch();
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new ConfigManager();
        }
        return this.instance;
    }

    private loadConfig(): AppConfig {
        const file = fs.readFileSync(this.CONFIG_PATH);
        return JSON.parse(file.toString());
    }

    public getConfig(): AppConfig {
        return this.config; // 👈 always latest in memory
    }

    private watch() {
        fs.watchFile(this.CONFIG_PATH, () => {
            console.log("🔄 Config updated, reloading...");
            this.config = this.loadConfig();
        });
    }
}