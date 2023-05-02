# Python Atomizer

Deconstruct python code and assign each function a CID on IPFS

**Getting Started**

1. Install dependencies with `npm install`
2. Create an .env file with the following parameter ([Web3.storage](https://web3.storage/) API key)

   ```plaintext
   WEB3_STORAGE_KEY="<API KEY GOES HERE>"
   ```
3. Add python program to the *inputs* folder
4. Profile the workflow in the inputs folder with `python -m cProfile -o profile <PROGRAM_ENTRY>.py`
5. Run atomizer in root directory with `ts-node profiled.ts`
