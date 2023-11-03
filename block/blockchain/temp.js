const fs = require('fs');

// Load the ABI from the JSON file
const contractData = JSON.parse(fs.readFileSync('./build/contracts/userId.json'));
const contractABI = contractData.abi;
console.log(contractABI)
// Now, you can use the 'contractABI' in your code to interact with the smart contract.
