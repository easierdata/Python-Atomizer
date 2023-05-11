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

class moduleFuncFinder {
    directory: fs.PathLike

    constructor(data: {
        directory: fs.PathLike,
    }) {
        this.directory = data.directory
    }

    /**
     * @function getImports
     * 
     * pull function imports
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

        return this.writeToDictionary(importStatements)
    }

    /**
     * @function writeToDictionary
     * 
     */
    async writeToDictionary(imports: ImportStatement[]): Promise<void> {
        if (!fs.existsSync('scripts/tmp')) fs.mkdirSync('scripts/tmp')
        let dictionary;

        if (fs.existsSync('scripts/tmp/secondary_definitions.json')) {
            // Append and overwrite
            dictionary = JSON.parse(fs.readFileSync('scripts/tmp/secondary_definitions.json', 'utf8'))
            dictionary[`${this.directory.toString()}`] = imports
        } else {
            dictionary = {
                [`${this.directory.toString()}`]: imports
            }
        }

        fs.writeFileSync('scripts/tmp/secondary_definitions.json', JSON.stringify(dictionary), 'utf-8')
        return
    }
}

export default moduleFuncFinder