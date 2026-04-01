type ServerConfig = {
    local: boolean;
    port: number;
    proxy?: string;
    secret: string
}

export type RepoConfig = {
    name: string;
    repo: string;
    branch: string;
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
