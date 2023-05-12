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

    async writeParentFunctions(): Promise<void> {
        this.cids = JSON.parse(fs.readFileSync('scripts/tmp/result.json', 'utf-8'))
        //console.log(Object.keys(this.cids.functions))

        for (let x = 0; x < Object.keys(this.dictionary).length; x++) {
            let element = {}

            // For every function in dictionary, get CID
            for (let i = 0; i < Object.keys(this.cids.functions).length; i++) {
                if (Object.keys(this.dictionary)[x].includes(Object.keys(this.cids.functions)[i].split('.py')[0])) {
                    let dependencies = []
                    if (this.dictionary[Object.keys(this.dictionary)[x]].dependencies?.length > 0) {
                        dependencies = await this.writeDependencyFunctions(this.dictionary[Object.keys(this.dictionary)[x]].dependencies)
                    }

                    let element = {
                        [`${Object.keys(this.cids.functions)[i]}`]: {
                            'cid': this.cids.functions[Object.keys(this.cids.functions)[i]],
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

    // return dependency array
    async writeDependencyFunctions(file: any[]): Promise<any[]> {
        let dependencies = []

        for (let x = 0; x < file.length; x++) {
            if (Object.keys(this.cids.functions).includes(`${Object.keys(file[x])[0]}.py`)) {
                dependencies.push({
                    [`${Object.keys(file[x])[0]}.py`]: this.cids.functions[`${Object.keys(file[x])[0]}.py`]
                })
            }
        }

        return dependencies
    }

    // for each 
    async writeManifest(): Promise<void> {
        const output = JSON.stringify(this.manifest)

        fs.writeFileSync('outputs/manifest.json', output, 'utf-8')
    }
}

export default createManifest

/*
output should be

{
    funcName: {
        cid: 'jdsakdaw'
        dependencies: [cid1, cid2]
    },
    funcName: {
        cid: ''
    }
}

to achieve this
for each function
 */