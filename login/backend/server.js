const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the 'cors' middleware
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

mongoose.connect('mongodb://0.0.0.0:27017/agreement-app');  

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', UserSchema);

app.post('/api/users', async (req, res) => {
  const { username, password } = req.body;

  const user = new User({
    username,
    password,
  });

  await user.save();

  // Set CORS headers here
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  res.json({
    message: 'User created successfully!',
  });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
