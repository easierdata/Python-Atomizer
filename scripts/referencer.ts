/**
 * @file referencer.ts
 * 
 * Analyzes outputs folder and points functions to their respective files
 */

import * as fs from 'fs'
import * as dotenv from "dotenv"
dotenv.config()

/**
 * psuedo code:
 * 
 * 1. Parse file name
 * 2. Find function calls
 * 3. If present, check outputs folder to see if function was extracted
 * 4. if so add import
 * 5. continue
 */

class Referencer {
    directory: fs.PathLike
    functions: string

    constructor(data: {
        functions: any,
        directory: fs.PathLike
    }) {
        this.directory = data.directory
        this.functions = data.functions
    }

    /**
     * @function readFunction 
     * 
     * Parses python function
     */
    async readFunction(): Promise<void> {
        // Read file contents and split by line
        const fileContents = fs.readFileSync(this.directory, 'utf-8')
        const fileLines = fileContents.split('\n')

        return this.findFunctionCalls(fileLines)
    }

    /**
     * @function findFunctionCalls
     * 
     * @param fileLines Array of python file code
     * 
     * Find function invocations and adds necessary imports
     */
    async findFunctionCalls(fileLines: string[]): Promise<void> {
        let newFile = [...fileLines]

        // Trim .py from every function
        let functionNames = []
        for (let x = 0; x < this.functions.length; x++) {
            functionNames.push(this.functions[x].substring(0, this.functions[x].length - 3))
        }

        //console.log(this.directory)

        // Iterate through function lines
        for (let x = 0; x < fileLines.length; x++) {

            // Check for function calls
            const functionIdentifier = /[A-Za-z0-9]+\([A-Za-z0-9]+\)/i
            const functionIdentifier2 = /[A-Za-z0-9]+\(/i
            if ((functionIdentifier.test(fileLines[x]) || functionIdentifier2.test(fileLines[x])) && !fileLines[x].includes('def')) {
                // Multiple functions may be on one line [i.e nesting]
                const lineSplit = fileLines[x].split('(')
                const substr = lineSplit[0]
                const functionName = substr.split(' ').slice(-1)[0]

                for (const snippet in lineSplit) {
                    // Replace white space and check if function is not already imported
                    if (functionNames.includes(functionName) && !newFile.includes(`from ${functionName} import ${functionName}`)) {
                        newFile.unshift(`from ${functionName} import ${functionName}`)
                    }
                }
            }
        }

        // Merge new contents and overwrite function file
        let data = ''
        for (let x = 0; x < newFile.length; x++) {
            data = data.concat(newFile[x] + '\n')
        }
        
        fs.writeFileSync(this.directory, data, 'utf-8')
    }
}

export default Referencer