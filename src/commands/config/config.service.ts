import inquirer from "inquirer";
import fs from 'fs';
import path from "path";
import { execa } from "execa";

export class ConfigService {

    constructor() {
        console.log('ConfigService initialized');
    }

    private getFilePathforPipeline(pipelineName: string): string {
        const pipelineFilePath = path.join(process.cwd(), 'pipelines', pipelineName, `${pipelineName}.jarvis.yaml`)
        return pipelineFilePath
    }

    createTempPipelineDirectory(pipelineName: string): string | null {
        const tempDirPath = path.join(process.cwd(), 'tmp', pipelineName.replace('/', '-'))
        try {
            if (!this.pathExist(tempDirPath)) {
                fs.mkdirSync(tempDirPath, { recursive: true })
            }
            return tempDirPath
        } catch (error) {
            console.error('Error creating temporary pipeline directory:', error);
            return null
        }
    }

    private createPipelineDirectory(pipelineName: string): string | null {
        const pipelineDirPath = path.join(process.cwd(), 'pipelines', pipelineName)

        try {
            if (!this.pathExist(pipelineDirPath)) {
                fs.mkdirSync(pipelineDirPath, { recursive: true })
            }
            return pipelineDirPath
        } catch (error) {
            return null
        }
    }

    private createPipelineFile(pipelineName: string): string | null {

        try {

            const pipelineDirPath = this.createPipelineDirectory(pipelineName)

            if (!pipelineDirPath) {
                console.error('Failed to create pipeline directory. Cannot proceed to create pipeline file.');
                return null
            }

            const pipelineFilePath = path.join(pipelineDirPath, `${pipelineName}.jarvis.yaml`)

            if (!this.pathExist(pipelineFilePath)) {
                fs.writeFileSync(pipelineFilePath, '', { flag: 'w' })
            }
            return pipelineFilePath
        } catch (error) {
            console.error('Error creating pipeline file:', error);
            return null
        }

    }

    private pathExist(path: string): boolean {
        try {
            return fs.existsSync(path)
        } catch (error) {
            console.error('Error checking path existence:', error);
            return false
        }
    }

    async openPipelineFileEditor(pipelineName: string): Promise<string | null> {
        try {

            const pipelineFilePath = this.getFilePathforPipeline(pipelineName)

            if (!this.pathExist(pipelineFilePath)) {
                const createdFilePath = this.createPipelineFile(pipelineName)
                if (!createdFilePath) {
                    throw new Error('Failed to create pipeline file. Cannot open editor.');
                }
            }

            await execa('nano', [pipelineFilePath], {
                stdio: 'inherit'
            });
            return pipelineFilePath
        } catch (error) {
            console.error('Error opening pipeline file editor:' + error);
            return null
        }
    }

    askForLocalorRemote(): Promise<{ local: boolean }> {
        return inquirer.prompt({
            type: 'confirm',
            name: 'local',
            message: 'Do you want to run the pipeline localhost or public IP enabled server? choose "yes" for localhost and "no" for public IP enabled server',
            default: false,
        })
    }

    getProxyURL(): Promise<{ proxy: string }> {
        return inquirer.prompt({
            type: 'input',
            name: 'proxy',
            message: 'Enter the proxy URL from smee.io (e.g. https://smee.io/key): (go to smee.io and copy the proxy URL and paste it here) ',
            validate: (input) => {
                try {
                    const match = input.match(/^https?:\/\/smee\.io\/[a-zA-Z0-9]+$/);
                    if (!match) {
                        throw new Error('Invalid smee.io URL format');
                    }
                    return true
                } catch (error) {
                    console.error('Invalid URL format. Please enter a valid proxy URL.');
                    return false
                }
            },
        })
    }

    getPipelineName(): Promise<{ pipelineName: string }> {
        return inquirer.prompt({
            type: 'input',
            name: 'pipelineName',
            message: 'Enter the name of the pipeline:',
            validate: (input) => {
                return input.trim() !== ''
            }
        })
    }

    getGithubRepo(): Promise<{ githubRepoURL: string }> {
        return inquirer.prompt({
            type: 'input',
            name: 'githubRepoURL',
            message: 'Enter the Github repository URL (e.g. username/repo)',
            validate: (input) => {
                console.log('Validating GitHub repository URL:', input);
                return input.includes('/')
            }
        })

    }

    getBranchName(): Promise<{ branchName: string }> {
        return inquirer.prompt({
            type: 'input',
            name: 'branchName',
            message: 'Enter the branch name to watch (default: main):',
            default: 'main',
        })
    }

    getWebhookSecret(): Promise<{ webhookSecret: string }> {
        return inquirer.prompt({
            type: 'password',
            name: 'webhookSecret',
            message: 'Enter the webhook secret (will be hidden):',
            mask: '*',
        })
    }

    getPortNumber(): Promise<{ portNumber: number }> {
        return inquirer.prompt({
            type: 'number',
            name: 'portNumber',
            message: 'Enter the port number for the webhook server (default: 5050):',
            default: 5050,
            validate: (input) => {

                if (input && input > 0 && input < 65536) {
                    return true
                } else {
                    return 'Invalid port number. Please enter a number between 1 and 65535.'
                }
            },
        })
    }






}