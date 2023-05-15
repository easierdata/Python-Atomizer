/**
 * @file createManifest
 * 
 * Writes function/cid manifest to file
 */

import * as fs from 'fs'

class createManifest {
    dictionary: any
    manifest: {}
    cids: any

    constructor(data: {
        dictionary: {}
    }) {
        this.dictionary = data.dictionary
        this.manifest = {}
        this.cids = {}
    }

    /**
     * @function writeParentFunctions
     * 
     * Appends parent functions to dictionary
     */
    async writeParentFunctions(): Promise<void> {
        this.cids = JSON.parse(fs.readFileSync('scripts/tmp/result.json', 'utf-8'))

        for (let x = 0; x < Object.keys(this.dictionary).length; x++) {
            // For every function in dictionary, get CID
            for (let i = 0; i < Object.keys(this.cids.functions).length; i++) {
                if (Object.keys(this.dictionary)[x].includes(Object.keys(this.cids.functions)[i].split('.py')[0])) {
                    let dependencies = []
                    if (this.dictionary[Object.keys(this.dictionary)[x]].dependencies?.length > 0) {
                        dependencies = await this.writeDependencyFunctions(this.dictionary[Object.keys(this.dictionary)[x]].dependencies)
                    }

                    let element = {
                        [`${this.cids.functions[Object.keys(this.cids.functions)[i]]}`]: {
                            'function_name': `${Object.keys(this.cids.functions)[i]}`,
                            'dependencies': dependencies
                        }
                    }

                    this.manifest = {
                        ...this.manifest,
                        ...element
                    }
                }
            }
        }

        return this.writeManifest()
    }

    /**
     * @function writeDependencyFunctions 
     * 
     * Append dependencies to parent element
     * 
     * @param file list of dependency files
     */
    async writeDependencyFunctions(file: any[]): Promise<any[]> {
        let dependencies = []

        for (let x = 0; x < file.length; x++) {
            if (Object.keys(this.cids.functions).includes(`${Object.keys(file[x])[0]}.py`)) {
                dependencies.push({
                    [`${this.cids.functions[`${Object.keys(file[x])[0]}.py`]}`]: `${Object.keys(file[x])[0]}.py`
                })
            }
        }

        return dependencies
    }

    /**
     * @function writeManifest
     * 
     * Write dictionary object to manifest file
     */
    async writeManifest(): Promise<void> {
        const output = JSON.stringify(this.manifest)

        fs.writeFileSync('outputs/manifest.json', output, 'utf-8')
    }
}

export default createManifest