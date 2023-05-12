/**
 * @file moduleFuncExtractor
 * 
 * Traverse primary outputs and extract moduled functions
 */

import { glob } from "glob"
import * as fs from 'fs'
import Extractor from "./extractor";

class moduleFuncExtractor {
    invocations: any;
    primaryFunctionsBlob: any;
    dictionary: {};

    constructor() {
        this.dictionary = {}
        this.invocations = []
        this.primaryFunctionsBlob = ''
    }

    async readPrimaryExtraction(): Promise<any> {
        this.primaryFunctionsBlob = JSON.parse(fs.readFileSync('scripts/tmp/primary_functions.json', 'utf-8'))
        await this.createInvocationDictionary()
        //console.log(this.invocations)

        const inputFiles = await glob('./outputs/**/*.py')

        for (let x = 0; x < inputFiles.length; x++) {
            await this.findModulesInvocations(inputFiles[x])
        }

        return this.dictionary
    }

    async createInvocationDictionary(): Promise<void> {
        const programModules = JSON.parse(fs.readFileSync('scripts/tmp/secondary_definitions.json', 'utf-8'))
        //console.log(programModules)

        for (let x = 0; x < Object.keys(programModules).length; x++) {
            const programFile = Object.keys(programModules)[x]

            // File does not import anything
            if (programModules[programFile].length == 0) continue
            
            const imports = programModules[programFile]

            for (const fileImport in imports) {
                const functions = imports[fileImport]['names']

                functions.forEach((element: any) => {
                    // push function name : module k/v pair
                    this.invocations.push({
                        [`${element}`]: imports[fileImport]['module'] ? imports[fileImport]['module'].split(' as ')[0] : functions[0].split(' as ')[0]
                    })
                });
            }
        }
    }

    async findModulesInvocations(directory: fs.PathLike): Promise<void> {
        const functionContents = fs.readFileSync(directory, 'utf-8')
        const functionLines = functionContents.split('\n')
        let functionDictionary: any = {
            [`${directory}`]: {
                dependencies: []
            }
        }

        for (let x = 0; x < functionLines.length; x++) {
            for (let i = 0; i < this.invocations.length; i++) {
                const invocationName = Object.keys(this.invocations[i])[0].split(' as ')
                
                if (functionLines[x].includes(`${invocationName[invocationName.length - 1]}(`) ||
                    functionLines[x].includes(`${invocationName[invocationName.length - 1]}.`)) {
                    //console.log('Found ' + invocationName[invocationName.length - 1] + ': ' + functionLines[x])
                    
                    let functionName: any = functionLines[x].split('(')[0].split('.')
                    functionName = functionName[functionName.length - 1].split(' ')
                    //console.log(functionName[functionName.length - 1])
                    //console.log(Object.keys(this.invocations[i])[0] + ' : ' + functionName[functionName.length - 1])

                    if (this.primaryFunctionsBlob[`${functionName[functionName.length - 1]}`] && !functionDictionary[`${directory}`]['dependencies'].some((obj: {}) => Object.keys(obj)[0] === `${functionName[functionName.length - 1]}`)) {
                        functionDictionary[`${directory}`]['dependencies'].push({
                            [`${functionName[functionName.length - 1]}`]: this.primaryFunctionsBlob[`${functionName[functionName.length - 1]}`]
                        })

                        const extract = new Extractor({
                            functionName: `${functionName[functionName.length - 1]}`,
                            directory: this.primaryFunctionsBlob[`${functionName[functionName.length - 1]}`][0][0],
                            lineNumber: this.primaryFunctionsBlob[`${functionName[functionName.length - 1]}`][0][1]
                        })

                        await extract.extractFunction()
                    } else if (this.primaryFunctionsBlob[`_${functionName[functionName.length - 1]}`] && !functionDictionary[`${directory}`]['dependencies'].some((obj: {}) => Object.keys(obj)[0] === `_${functionName[functionName.length - 1]}`)) {
                        // case for reserved words
                        functionDictionary[`${directory}`]['dependencies'].push({
                            [`_${functionName[functionName.length - 1]}`]: this.primaryFunctionsBlob[`_${functionName[functionName.length - 1]}`]
                        })

                        const extract = new Extractor({
                            functionName: `_${functionName[functionName.length - 1]}`,
                            directory: this.primaryFunctionsBlob[`_${functionName[functionName.length - 1]}`][0][0],
                            lineNumber: this.primaryFunctionsBlob[`_${functionName[functionName.length - 1]}`][0][1]
                        })

                        await extract.extractFunction()
                    }
                }
            }
        }

        this.dictionary = {
            ...this.dictionary,
            ...functionDictionary
        }
    }
}

/**
 * final manifest
 * func name: {
 *  cid: 'ndnsajd'
 *  dependencies: [cid1, cid2]
 * }
 * 
 * middle
 * funcDirectory: {
 *  dependencies: [
 *      {
 *          funcname: blahh
 *          subfuncDirectory: blahhh2 
 *      } 
 *  ]
 * }
 * 
 * while uploading: {
 *  filename: cid
 * }
 */

export default moduleFuncExtractor