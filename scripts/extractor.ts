/**
 * @file extractor.ts
 * 
 * Ingests function location and write to output folder
 */

import * as fs from 'fs'
import * as dotenv from "dotenv"
dotenv.config()

class Extractor {
    directory: fs.PathLike;
    lineNumber: number;
    functionName: string;

    constructor(data: {
        functionName: string;
        directory: fs.PathLike,
        lineNumber: number
    }) {
        this.functionName = data.functionName
        this.directory = data.directory
        this.lineNumber = data.lineNumber
    }

    /**
     * @function extractFunction 
     * 
     * Parses python file and writes function snippets to outputs folder.
     */
    async extractFunction(): Promise<void> {
        try {
            // Read file contents and split by line
            const fileContents = fs.readFileSync(this.directory, 'utf-8')
            const fileLines = fileContents.split('\n')

            // Find the end of function
            let endline = 0;
            for (let x = this.lineNumber; x < fileLines.length; x++) {
                if (!fileLines[x].startsWith(' ') && fileLines[x] !== '' || x === fileLines.length) {
                    endline = x
                    break;
                }
            }

            // Write functions to distinct files
            let data = '';

            // Get contents through start and end lines
            for (var i = this.lineNumber - 1; i < endline; i++) {
                data = data + fileLines[i] + '\n'
            }
            
            // Write function to file
            fs.writeFileSync(`outputs/${this.functionName}`, data, 'utf8')

            return
        } catch (e: any) {
            throw new Error(`Error extracting function: ${e}`)
        }
    }
}

export default Extractor