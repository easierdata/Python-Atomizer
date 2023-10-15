/**
 * @file moduleFuncFinder
 * 
 * Extract program dependencies
 */

import * as fs from 'fs';
import { ImportStatement, importElement } from './types';
import { exec } from 'child_process';
import * as toml from 'toml'

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

        await this.cloneEnvironment(importStatements)

        return this.writeToDictionary(importStatements)
    }

    /**
     * @function writeToDictionary
     * 
     * Writes function hierarchy to file
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

    /**
     * @function cloneEnvironment
     * 
     * Create a requirements.txt of used pip modules
     * 
     * @param imports array of import statements
     */
    async cloneEnvironment(imports: any[]): Promise<void> {
        if (fs.existsSync('./inputs/pyproject.toml')) {
            // If poetry detected in project, get deps from toml file
            const tomlFile = await fs.readFileSync('./inputs/pyproject.toml', 'utf-8')

            const parsed = toml.parse(tomlFile)
            //  console.log(JSON.stringify(parsed.tool.poetry.dependencies))
            
            let requirements = ''

            Object.keys(parsed.tool.poetry.dependencies).forEach((key: string) => 
                requirements += `${key}==${parsed.tool.poetry.dependencies[key].split(',')[0]}\n`
            )

            fs.writeFileSync('scripts/tmp/requirements.txt', requirements, 'utf-8')
        } else {
            // Make list of modules
            let modules: string[] = []
            imports.forEach((element: importElement) => {
                if (element.module) {
                    modules.push(element.module.split('.')[0])
                } else {
                    modules.push(element.names[0].split(' as ')[0].split('.')[0])
                }
            })

            // Create requirements.txt contents
            let child = exec('python -m pip freeze')
            let requirements = ''

            child.stdout?.on('data', (data) => {
                // Split the output by newlines and print line by line
                const lines = data.trim().split('\n');
                lines.forEach((line: string) => {
                    if (modules.includes(line.split('=')[0])) requirements += `${line}\n`
                });
            });
            
            child.stderr?.on('data', (data) => {
                console.error(`[!] Requirement error: ${data}`);
            });
            
            child.on('close', (code) => {
                fs.writeFileSync('scripts/tmp/requirements.txt', requirements, 'utf-8')
            })
        }
    }
}

export default moduleFuncFinder