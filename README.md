# Python Atomizer

Deconstruct python code and assign each function a CID on IPFS

**Getting Started**

1. Install dependencies with `npm install` and `python3 -m pip install -r requirements.txt`
2. Create an .env file with the following parameter ([Web3.storage](https://web3.storage/) API key)

   ```plaintext
   WEB3_STORAGE_KEY="<API KEY GOES HERE>"
   ```
3. Add python program to the `inputs` folder
4. Profile the workflow in the root directory with `python -m cProfile -o inputs/profile inputs/<PROGRAM_ENTRY>.py`
5. Run atomizer in root directory with `ts-node index.ts`

**Node Version**

This project was developed and tested with node version `v18.14.1` the support for other versions is currently unknown. Feel free to use a [node version manager](https://github.com/tj/n) to easily swap between versions
