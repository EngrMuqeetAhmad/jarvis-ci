import fs from "fs";
import path from "node:path";
export class ConfigManager {
    static instance;
    config;
    CONFIG_PATH = path.join(process.cwd(), "configs", ".jarvis-ci.json");
    constructor() {
        this.config = this.loadConfig();
        // this.watch();
    }
    startWatching() {
        this.watch();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ConfigManager();
        }
        return this.instance;
    }
    loadConfig() {
        const file = fs.readFileSync(this.CONFIG_PATH);
        return JSON.parse(file.toString());
    }
    getConfig() {
        return this.config; // 👈 always latest in memory
    }
    watch() {
        fs.watchFile(this.CONFIG_PATH, () => {
            console.log("🔄 Config updated, reloading...");
            this.config = this.loadConfig();
        });
    }
}
