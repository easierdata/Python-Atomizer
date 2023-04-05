/**
 * @file index.ts
 * 
 * Proof-of-concept to highlight breaking down a python file by function and 
 * assigning each component a CID on IPFS
 */

import * as fs from 'fs'
import * as dotenv from "dotenv"
dotenv.config()

class Main {
    apiKey: string | undefined

    constructor() {
        this.apiKey = process.env.WEB3_STORAGE_KEY

        if (!this.apiKey) throw new Error("Configure ENV file first!")
        this.traverseInputs()
    }

    /**
     * @function traverseInputs
     * 
     * Filters through inputs directory and saves python files only
     */
    async traverseInputs(): Promise<void> {
        const files = fs.readdirSync('inputs')
        const pythonFiles = files.filter((file: string) => file.includes('.py') && file != 'example.py')

        // For every file in the inputs folder
        for (const file in pythonFiles) {
            await this.findContent(pythonFiles[file])
        }
    }

    async findContent(name: string): Promise<void> {
        // Read file contents and split by line
        const fileContents = fs.readFileSync(`inputs/${name}`, 'utf-8')
        const fileLines = fileContents.split('\n')

        // Determine the lines of where functions are identified
        const functionIdentifiers = /[A-Za-z]ef\s+.*\(.*\):/i
        let startLines = []
        for (let x = 0; x < fileLines.length; x++) {
            if (functionIdentifiers.test(fileLines[x])) {
                startLines.push(x)
            }
        }

        // Determine the end of every function
        let endLines = []
        for (const start in startLines) {
            for (let x = startLines[start] + 1; x < fileLines.length; x++) {
                if (!fileLines[x].startsWith(' ') && fileLines[x] != '' || x == fileLines.length) {
                    endLines.push(x)
                    break;
                }
            }
        }

        // Array of names of all functions
        let functionNames = []

        // Write functions to distinct files
        for (let x = 0; x < startLines.length; x++) {
            let data = '';

            // Get contents through start and end lines
            for (var i = startLines[x]; i < endLines[x]; i++) {
                data = data + fileLines[i] + '\n'
            }
            
            fs.writeFileSync(`outputs/${fileLines[startLines[x]].split('def ')[1].split('(')[0]}.py`, data, 'utf8')
            functionNames.push(`${fileLines[startLines[x]].split('def ')[1].split('(')[0]}.py`)
        }

        this.uploadToIPFS(name, functionNames)
    }

    async uploadToIPFS(name: string, functions: string[]) {
        /**
         * Example dictionary
         * 
         * {
         *  original: <cid>
         *  functions: {
         *      ex1: <cid>
         *      ...
         *  }
         * }
         */
        console.log(name)
        console.log(functions)

        // Upload original file to IPFS


        // Upload functions to IPFS
    }
}

const tmp = new Main();

/**
 * Comments for Matt:
 * 
 * Part I:
 * 1. Traverse through inputs,
 * 2. Parse files by line
 * 3. Find the beginning of each function
 * 4. For each function, find the next line where the character is != white-space
 * 5. Dump that range into a file 
 * 
 * Part II:
 * 1. Name each file their respective function names
 * 2. Upload to IPFS
 * 3. Dump all CIDs to a file
 * 
 * Part III:
 * 1. Add to JSON the references of other functions/CIDs
 */