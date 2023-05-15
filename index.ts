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
import Uploader from './scripts/uploader'
import { glob } from 'glob'
import moduleFuncFinder from './scripts/moduleFuncFinder'
import moduleFuncExtractor from './scripts/moduleFuncExtractor'
import createManifest from './scripts/createManifest'
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
            const handler = new moduleFuncFinder({
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

        return this.extractModuleFunctions()
    }

    /**
     * @function extractModuleFunctions
     * 
     * Extracts imported functions 
     */
    async extractModuleFunctions(): Promise<void> {
        let dictionary: any;
        if (fs.existsSync('scripts/tmp/secondary_definitions.json')) {
            const extract = new moduleFuncExtractor()

            dictionary = await extract.readPrimaryExtraction()
            //console.log(JSON.stringify(dictionary))
        }

        return this.uploadToIPFS(dictionary)
    }

    /**
     * @function uploadToIPFS
     * 
     * Uploads atomized functions to IPFS and outputs JSON manifest
     */
    async uploadToIPFS(dictionary: {}): Promise<void> {
        const files = fs.readdirSync('outputs')
        const pythonFiles = files.filter((file: string) => file.includes('.py'))

        const upload = new Uploader({
            functions: pythonFiles
        })

        await upload.uploadToIPFS()

        return this.createManifest(dictionary)
    }

    /**
     * @function createManifest 
     * 
     * Writes function/cid manifest to JSON file
     * 
     * @param dictionary JSON of functions and CIDs
     */
    async createManifest(dictionary: {}): Promise<void> {
        const manifest = new createManifest({
            dictionary
        })

        await manifest.writeParentFunctions()
        console.log(`[!] Wrote manifest to outputs/manifest.json`)
    }
}

const tmp = new Profiled()