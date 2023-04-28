/**
 * @file uploader.ts
 * 
 * Ingests function location and write to output folder
 */

import * as fs from 'fs'
import * as dotenv from "dotenv"
import { Web3Storage, getFilesFromPath } from 'web3.storage'
dotenv.config()

class Uploader {
    functions: string[]
    apiKey: string | undefined

    constructor(data: {
        functions: string[],
    }) {
        this.functions = data.functions
        this.apiKey = process.env.WEB3_STORAGE_KEY
    }

    /**
     * @function uploadToIPFS
     * 
     * Uploads atomized functions to IPFS and creations dictionary to map CIDs
     */
    async uploadToIPFS(): Promise<void> {
        if (!this.apiKey) throw new Error('Configure ENV File First!')
        const client = new Web3Storage({ token: this.apiKey })
        let dictionary = {}

        // Upload functions to IPFS
        try {
            let functions = {}

            for (var x = 0; x < this.functions.length; x++) {
                console.log(`[*] Uploading ${this.functions[x]} to ipfs...`)

                const file = await getFilesFromPath(`./outputs/${this.functions[x]}`)           
                const cid = await client.put(file)

                functions = {
                    ...functions,
                    [`${this.functions[x].split('.py')[0]}`]: cid
                }
            }
    
            dictionary = {
                ...dictionary,
                functions: {
                    ...functions
                }
            }
        } catch (e: any) {
            console.log(`Error uploading to IPFS: ${e}`)
        }

        this.writeResults(dictionary)
    }

    /**
     * @function writeResults
     * 
     * @param dictionary function-CID key value pair object
     * 
     * Write CID dictionary to JSON file locally
     */
    async writeResults(dictionary: any): Promise<void> {
        const output = JSON.stringify(dictionary)

        fs.writeFileSync('outputs/result.json', output, 'utf-8')
        console.log('[!] Finished operation, dictionary written to outputs/results.json')
    }
}

export default Uploader