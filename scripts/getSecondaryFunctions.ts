// ts:
// For each function in inputs directory profiled
// read input file and get list of imports
// create dictionary for ^

// py
// read dictionary
// find any related function calls
// place in outputs directory

/**
 * case 1
 * import <name>
 * usage: name.func()
 * 
 * case 2
 * from <name>.<sub_module> import <func>
 * usage: func()
 * 
 * case 3
 * import <name> as <name>
 * usage: name.func()
 * 
 * case 4
 * import <name>.<sub_module> as <name>
 * usage: <name>.<func>
 */

import * as fs from 'fs';

interface ImportStatement {
    type: 'Import' | 'ImportFrom';
    names: string[];
    module?: string;
}

class moduleFuncExtractor {
    directory: fs.PathLike

    constructor(data: {
        directory: fs.PathLike,
    }) {
        this.directory = data.directory
    }

    /**
     * @function getImports
     */
    async getImports(): Promise<void> {
        const importStatements: ImportStatement[] = []
        const fileContents = fs.readFileSync(this.directory, 'utf-8')
        const fileLines = fileContents.split('\n')

        for (let x = 0; x < fileLines.length; x ++) {
            const line = fileLines[x].trim()
            if (line.startsWith('import')) {
                // simple import statements
                const names = line
                    .replace('import', '')
                    .split(',')
                    .map(name => name.trim())
                importStatements.push({ type: 'Import', names })
            } else if (line.startsWith('from')) {
                // import statements with "from" 
                const [modulePart, namesPart] = line
                    .replace('from', '')
                    .split('import')
                    .map(part => part.trim())
                const module = modulePart.split(' ')[0]
                const names = namesPart.split(',').map(name => name.trim())
                importStatements.push({ type: 'ImportFrom', module, names })
            }
        }
        
        // Extract the names of all functions used by imports
        const importedFunctionNames: string[] = importStatements.reduce((acc: string[], importStatement: ImportStatement) => {
            if (importStatement.type === 'Import') {
                // simple import statements
                acc.push(...importStatement.names)
            } else {
                // import statements with "from"
                const modulePrefix = importStatement.module ?? ''
                const functionNames = importStatement.names.map(name => `${modulePrefix}.${name}`)
                acc.push(...functionNames)
            }
            return acc;
        }, [])

        console.log(importedFunctionNames)
    }
}

const test = new moduleFuncExtractor({
    directory: './inputs/morans_example.py'
})

test.getImports()
