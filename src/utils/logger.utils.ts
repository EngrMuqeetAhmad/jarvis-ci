import fs from "fs";
import path from "node:path";

export class Logger {
    private stream: any;

    constructor(baseDir: string) {
        console.log('Initializing logger with base directory:', baseDir);
        const dir = path.join(baseDir, "logs");
        fs.mkdirSync(dir, { recursive: true });

        const file = path.join(dir, "logs.txt");
        this.stream = fs.createWriteStream(file, { flags: "a" });
    }

    log(...args: any[]) {
        const msg = `[${new Date().toISOString()}] ${args.join(" ")}`;
        console.log(msg);
        this.stream.write(msg + "\n");
    }

    close() {
        this.stream.end();
    }
}