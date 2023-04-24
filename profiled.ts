/**
 * @file profiled.ts
 * 
 * Proof-of-concept to highlight breaking down a python file by function and 
 * assigning each component a CID on IPFS through ingesting a profiled program
 */

import * as fs from 'fs'
import * as dotenv from "dotenv"
import { spawn } from 'child_process'
import Extractor from './scripts/extractor'
dotenv.config()

class Profiled {
    apiKey: string | undefined

    constructor() {
        this.apiKey = process.env.WEB3_STORAGE_KEY

        this.parseProfile()
    }

    /**
     * @function parseProfile
     * 
     * Spawns helper subprocess to parse profile functions 
     */
    async parseProfile(): Promise<void> {
        // Check to see if profile exists
        if (!fs.existsSync('./inputs/profile')) throw new Error('[ERROR] profile does not exist in inputs directory!')

        // Execute helper in a subprocess
        const helper = spawn('python', ['scripts/helper.py'])

        helper.on('exit', (data) => {
            return this.readFunctions()
        });

        // Throw an error if subprocess fails
        helper.stderr.on('data', (data) => {
            throw new Error(`Helper error: ${data}`);
        });
    }

    /**
     * @function readFunctions
     * 
     * Spawns helper subprocess to parse profile functions 
     */
    async readFunctions(): Promise<void> {
        const functionDictionary = JSON.parse(fs.readFileSync('./functions.json', 'utf-8'))

        // Iterate through every function name
        Object.keys(functionDictionary).forEach(async (functionName: string) => {
            // Iterate through instance a function name is invoked
            const invocations = functionDictionary[functionName]

            for (let x = 0; x < invocations.length; x++) {
                
                // Files in the inputs directory have a unique case
                if (!fs.existsSync(invocations[x][0]) && invocations[x][0].includes('Python-Atomizer')) {
                    // Construct fixed directory
                    const inputFileDirectory: fs.PathLike = invocations[x][0].split('Python-Atomizer/')[0] + 
                        'Python-Atomizer/inputs/' + invocations[x][0].split('Python-Atomizer/')[1]
                    console.log(inputFileDirectory)
                    
                    // Extract function and write to outputs folder
                    const extract = new Extractor({
                        functionName,
                        directory: inputFileDirectory,
                        lineNumber: invocations[x][1]
                    })

                    await extract.extractFunction()
                } else {
                    // Extract function and write to outputs folder
                    const extract = new Extractor({
                        functionName,
                        directory: invocations[x][0],
                        lineNumber: invocations[x][1]
                    })

                    await extract.extractFunction()
                }
            }
        })
    }
}

const tmp = new Profiled();

// Filter the internal functions (only get the absolute, and the relative ones)
// Put functions in output directory