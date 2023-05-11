/**
 * @file extractor.ts
 * 
 * Ingests function location and write to output folder
 */

import * as fs from 'fs'
import * as dotenv from "dotenv"
dotenv.config()

class Extractor {
    directory: fs.PathLike
    lineNumber: number
    functionName: string

    constructor(data: {
        functionName: string,
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
        console.log(`[*] Extracting function: ${this.functionName}`)
        try {
            // Read file contents and split by line
            const fileContents = fs.readFileSync(this.directory, 'utf-8')
            const fileLines = fileContents.split('\n')

            // If nested, find parent class/function
            if (fileLines[this.lineNumber - 1].search(/\S/) !== 0) {
                for (let x = this.lineNumber; x > 0; x--) {
                    if (fileLines[x].search(/\S/) === 0) {
                        this.lineNumber = x + 1
                        break
                    }
                }
            }

            // Find the end of function
            let endline = 0
            for (let x = this.lineNumber - 1; x < fileLines.length; x++) {
                if (!fileLines[x].startsWith(' ') && fileLines[x] !== '' && x !== this.lineNumber - 1 || x === fileLines.length - 1) {
                    endline = x
                    break
                }
            }

            // Join function lines
            const data = this.joinFunction(fileLines, this.lineNumber -1, endline)

            // Add global variables
            const functionLines: string[] = await this.addGlobalVars(fileLines.slice(0, this.lineNumber), data.split('\n'))
            const functionString = this.joinFunction(functionLines, 0, functionLines.length)

            // Write function to file
            if(fs.existsSync('outputs')) {
                fs.writeFileSync(`outputs/${this.functionName}.py`, functionString, 'utf8')
            } else {
                fs.mkdirSync('outputs')
                fs.writeFileSync(`outputs/${this.functionName}.py`, functionString, 'utf8')
            }

            return
        } catch (e: any) {
            throw new Error(`Error extracting function: ${e}`)
        }
    }

    /**
     * @function addGlobalVars
     * 
     * @param fileLines Array of python file code
     * @param functionLines array of isolated function code
     * 
     * Finds uses of variables and adds definition to function
     */
    addGlobalVars(fileLines: string[], functionLines: string[]): string[] {
        let globalVars: string[] = [];

        fileLines.forEach((line: string) => {
            if (!line.trim().startsWith('class') && !line.trim().startsWith('def')) {
                // Test line for variable definition
                const match = line.match(/^\s*([a-zA-Z_]\w*)\s*=/)

                // Test for variable definition
                if (match) {
                    const [, varName] = match
                    for (let x = 0; x < functionLines.length; x++) {
                        if (functionLines[x].includes(varName)) {
                            if (match.input) {
                                const indentations = ' '.repeat(functionLines[x].search(/\S/))
                                functionLines.splice(x, 0, `${indentations + match.input}`)
                            }
                            break
                        }
                    }
                    globalVars.push(varName)
                }
            }
        })

        return functionLines
    }

    /**
     * @function joinFunctions
     * 
     * Joins split lines to function string
     * 
     * @param lines function lines
     * @param start start line number
     * @param end end line number
     * @returns joined function string
     */
    joinFunction(lines: string[], start: number, end: number): string {
        let joined = ''

        for (let x = start; x < end; x++) {
            joined = joined + lines[x] + '\n'
        }

        return joined
    }
}

export default Extractor