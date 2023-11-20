import axios from "axios";
import * as fs from 'fs';
import { glob } from 'glob';
import DesciExtractor from "./scripts/desciExtractor";

interface RootComponentPayload {
    path: string,
    cid: string,
    externalUrl?: string,
    keywords?: string[],
    description?: string,
    url?: string,
    title?: string,
    ontologyPurl?: string,
    cedarLink?: string,
    controlledVocabTerms?: string[],
}

interface RootComponent {
    id: string,
    name: string,
    type: string,
    payload: RootComponentPayload,
    starred: boolean,
}

class pyExtractor {
    pid: number;

    constructor(PID: number) {
        this.pid = PID;
    }

    async getRoot() {
        const response = await axios.get(`https://beta.dpid.org/${this.pid.toString()}?raw`, {
            headers: {
                "Content-Type": "application/json"
            }
        })

        const components: RootComponent[] = response.data.components;

        for (let x = 0; x < components.length; x++) {
            if (components[x].name === "Code Repository") {
                await this.getPyFiles(components[x].payload.path)
            }
        }
        
        await this.getParentFunctions();
    } 

    async getPyFiles(path: string) {
        const response = await axios.get(`https://beta.dpid.org/${this.pid.toString()}/${path}?raw`)
    
        const codeLinks = response.data.Links;
        
        // If no links/files
        if (!codeLinks) return []

        let pyFiles: any[] = []

        for (let x = 0; x < codeLinks.length; x++) {
            // If python file is found
            if (codeLinks[x].Name.includes(".") && codeLinks[x].Name.includes(".py")) {
                console.log("Python file found - " + codeLinks[x].Name)
                
                let file = {
                    ...codeLinks[x],
                    path: `${path}/${codeLinks[x].Name}`
                }
                
                await this.writePyFile(file.Hash["/"], file.Name)

                pyFiles.push(file)
                continue;
            } else if (codeLinks[x].Name.includes(".")) {
                // Filetype other than PY
                console.log("Non-python file found - " + codeLinks[x].Name)
                continue;
            } else {
                // Directory
                console.log("Directory found - " + codeLinks[x].Name)
                const sub: any = await this.getPyFiles(`${path}/${codeLinks[x].Name}`)
                pyFiles = [...pyFiles, ...sub]
            }
        }

        return pyFiles
    }

    async writePyFile(hash: string, name: string): Promise<void> {
        if (!fs.existsSync('./desci')) fs.mkdirSync('./desci')

        const response = await axios.get(`https://ipfs.desci.com/ipfs/${hash}`)

        fs.writeFileSync(`desci/${name}`, response.data, 'utf-8')
    }

    async getParentFunctions(): Promise<void> {
        const parentFiles = await glob('./desci/*.py', {
            ignore: './inputs/example.py'
        })

        parentFiles.forEach((dir: string) => {
            const extract = new DesciExtractor({
                directory: dir
            })

            extract.pullFunctions()
        })
    }
}

async function main() {
    // Replace PID with node of interest
    let tmp = new pyExtractor(76)
    const traversal = await tmp.getRoot();
}

main();