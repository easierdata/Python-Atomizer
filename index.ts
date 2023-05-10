/**
 * @file index.ts
 * 
 * Proof-of-concept to highlight breaking down a python file by function and 
 * assigning each component a CID on IPFS through ingesting a profiled program
 */

import * as fs from 'fs'
import * as dotenv from "dotenv"
import { spawn } from 'child_process'
import Extractor from './scripts/extractor'
import Referencer from './scripts/referencer'
import Uploader from './scripts/uploader'
import { glob } from 'glob'
import moduleFuncExtractor from './scripts/moduleFuncExtractor'
dotenv.config()

class Profiled {
    apiKey: string | undefined

    constructor() {
        this.apiKey = process.env.WEB3_STORAGE_KEY

        this.parseImports()
    }

    /**
     * @function parseImports
     * 
     * Create dictionary for imports in inputs directory
     */
    async parseImports(): Promise<void> {
        // Get array of all python files in inputs directory
        const inputFiles = await glob('./inputs/**/*.py', {
            ignore: './inputs/example.py'
        })

        // Traverse each file and parse inputs
        for (let x = 0; x < inputFiles.length; x++) {
            const handler = new moduleFuncExtractor({
                directory: inputFiles[x]
            })

            await handler.getImports()
        }

        return this.parseProfile()
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
        console.log('[!] Parsing profile (give this some time)...')
        let helper = spawn('python', ['scripts/helper.py'])

        helper.on('exit', (data) => {
            return this.readPrimaryFunctions()
        });

        helper.stdout.on('data', function(data) {
            // Do something with data to prevent hanging
            let tmp = data
        });

        // Throw an error if subprocess fails
        helper.stderr.on('data', (data) => {
            throw new Error(`Helper error: ${data}`)
        })
    }

    /**
     * @function readPrimaryFunctions
     * 
     * Spawns helper subprocess to parse front-facing functions 
     */
    async readPrimaryFunctions(): Promise<void> {
        if (!fs.existsSync('./outputs')) fs.mkdirSync('./outputs')
        const functionDictionary = JSON.parse(fs.readFileSync('./scripts/tmp/primary_functions.json', 'utf-8'))

        // Iterate through every function name
        Object.keys(functionDictionary).forEach(async (functionName: string) => {
            // Iterate through instance a function name is invoked
            console.log(`[*] Extracting function: ${functionName}`)
            const functions = functionDictionary[functionName]

            for (let x = 0; x < functions.length; x++) {
                
                // Some files in the inputs directory have a unique case
                if (!fs.existsSync(functions[x][0]) && functions[x][0].includes('Python-Atomizer')) {
                    // Construct fixed directory
                    const inputFileDirectory: fs.PathLike = functions[x][0].split('Python-Atomizer/')[0] + 
                        'Python-Atomizer/inputs/' + functions[x][0].split('Python-Atomizer/')[1]
                    
                    // Extract function and write to outputs folder
                    const extract = new Extractor({
                        functionName,
                        directory: inputFileDirectory,
                        lineNumber: functions[x][1]
                    })

                    await extract.extractFunction()
                } else {
                    if (functions[x][0].includes('inputs')) {
                        // Extract function and write to outputs folder
                        const extract = new Extractor({
                            functionName,
                            directory: functions[x][0],
                            lineNumber: functions[x][1]
                        })

                        await extract.extractFunction()
                    }
                }
            }
        })

        return this.uploadToIPFS()
    }

    /**
     * @function crossReference
     * 
     * Iterates through output functions and points them to one another
     */
    /* async crossReference(): Promise<void> {
        // Check to see if outputs exists
        if (!fs.existsSync('./outputs')) throw new Error('[ERROR] outputs directory does not exist!')

        const files = fs.readdirSync('outputs')
        const pythonFiles = files.filter((file: string) => file.includes('.py'))

        for (const file in pythonFiles) {
            const referencer = new Referencer({
                directory: `./outputs/${pythonFiles[file]}`,
                functions: pythonFiles
            })

            await referencer.readFunction()
        }

        return this.uploadToIPFS()
    } */

    /**
     * @function uploadToIPFS
     * 
     * Uploads atomized functions to IPFS and outputs JSON manifest
     */
    async uploadToIPFS(): Promise<void> {
        const files = fs.readdirSync('outputs')
        const pythonFiles = files.filter((file: string) => file.includes('.py'))

        const upload = new Uploader({
            functions: pythonFiles
        })

        await upload.uploadToIPFS()
    }
}

const tmp = new Profiled()