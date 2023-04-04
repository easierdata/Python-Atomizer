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
        //console.log(fileLines)

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
        //console.log(endLines)

        // Write functions to distinct files
        for (let x = 0; x < startLines.length; x++) {
            let data = '';

            // Get contents through start and end lines
            for (var i = startLines[x]; i < endLines[x]; i++) {
                data = data + fileLines[i] + '\n'
            }
            
            fs.writeFileSync(`outputs/${fileLines[startLines[x]].split('def ')[1].split('(')[0]}.py`, data, 'utf8')
        }
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