type ServerConfig = {
    local: boolean;
    port: number;
    proxy?: string;
}

export type RepoConfig = {
    name: string;
    repo: string;
    branch: string;
    secret: string;
    yamlPath: string;
    tempDir: string;
}

export type AppConfig = {
    server: ServerConfig;
    repos: RepoConfig[];
}

export type PipelineConfig = {
    steps: Step[];
}

export type Step = {
    name: string;
    run: {
        cmd: string;
        args: string[];
    }
}
