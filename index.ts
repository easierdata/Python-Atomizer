/**
 * @file index.ts
 * 
 * Proof-of-concept to highlight breaking down a python file by function and 
 * assigning each component a CID on IPFS
 */

import * as fs from 'fs'

class Main {
    constructor() {
        this.traverseInputs()
    }

    /**
     * @function traverseInputs
     * 
     * Filters through inputs directory and saves python files only
     */
    async traverseInputs(): Promise<void> {
        const files = fs.readdirSync('inputs')
        const pythonFiles = files.filter((file: string) => file.includes('.py'))
        //console.log(pythonFiles)
        return this.findContent();
    }

    async findContent(): Promise<void> {
        // Read file contents and split by line
        const fileContents = fs.readFileSync(`inputs/temp.py`, 'utf-8')
        const fileLines = fileContents.split('\n')
        console.log(fileLines)

        // Determine the lines of where functions are identified
        const functionIdentifiers = /[A-Za-z]ef\s+.*\(.*\):/i
        let lineNumbers = []
        for (let x = 0; x < fileLines.length; x++) {
            if (functionIdentifiers.test(fileLines[x])) {
                lineNumbers.push(x + 1)
            }
        }
        console.log(lineNumbers)
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