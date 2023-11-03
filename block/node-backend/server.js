const express = require('express');
const ethers = require('ethers');
const app = express();
const port = 3001;
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Replace with your contract ABI and address
const contractABI = [
  {
    inputs: [],
    name: 'user1',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'user2',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      { type: 'uint256' },
      { type: 'uint256' },
    ],
    name: 'storeData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const contractAddress = '0xa72d77666054E496f1fE07Ed04C017c8dC75AC56'; // Your contract's address

// Initialize ethers.js provider and contract instance
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545'); // Replace with your RPC URL
const contract = new ethers.Contract(contractAddress, contractABI, provider);

app.post('/storeData', async (req, res) => {
  const { user1, user2 } = req.body;

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Store data on the blockchain
  try {
    const signer = provider.getSigner('0xAD02EC7f13AFbDAd2b220777316Bc0F40cc08612'); // Use a sender address
    const tx = await contract.connect(signer).storeData(user1, user2);
    await tx.wait();
    res.json({ message: 'Data stored on the blockchain.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to store data on the blockchain.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
