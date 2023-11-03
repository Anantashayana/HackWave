const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());
mongoose.connect('mongodb://0.0.0.0/agreement-app', { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String,
}));

const Agreement = mongoose.model('Agreement', new mongoose.Schema({
  title: String,
  description: String,
  senderUserId: mongoose.Schema.Types.ObjectId,
  recipientUserId: mongoose.Schema.Types.ObjectId,
  recipientUsername: String,
  created_at: Date,
  responses: [{
    userId: mongoose.Schema.Types.ObjectId,
    response: Boolean,
  }],
}));

const Response = mongoose.model('Response', new mongoose.Schema({
  agreementId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  response: Boolean,
}));

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: 'Incorrect username.' });

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return done(null, false, { message: 'Incorrect password.' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.status(201).send('User created successfully.');
  } catch (err) {
    res.status(400).send('Registration failed.');
    console.log(err);
  }
});

app.post('/api/login', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).send('Login failed');
    }
    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      res.redirect('http://localhost:3001/create-agreement');
    });
  })(req, res, next);
});


app.get('/api/logout', (req, res) => {
  req.logout();
  res.send('Logged out.');
});

app.post('/api/create-agreement', async (req, res) => {
  const { title, description, sendersUsername, recipientUsername } = req.body;
  //const senderUserId = req.user._id;

  try {
    const recipient = await User.findOne({ username: recipientUsername });
    if (!recipient) {
      return res.status(404).send('Recipient not found.');
    }

    const agreement = new Agreement({
      title,
      description,
      sendersUsername,
      //recipientUserId: recipient._id,
      recipientUsername: recipientUsername,
      created_at: new Date(),
    });

    await agreement.save();

    res.status(201).send('Agreement created successfully.');
  } catch (err) {
    res.status(400).send('Agreement creation failed.');
    console.log(err);
  }
});

app.get('/api/pending-agreements', async (req, res) => {
  //const userId = req.user._id;

  try {
    const agreements = await Agreement.find({ recipientUserId: userId });
    res.status(200).json(agreements);
  } catch (err) {
    res.status(400).send('Failed to fetch pending agreements.');
    console.log(err);
  }
});

app.post('/api/respond-agreement', async (req, res) => {
  const { agreementId, response } = req.body;
  const userId = req.user._id;

  try {
    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).send('Agreement not found.');
    }

    const existingResponse = await Response.findOne({ agreementId, userId });
    if (existingResponse) {
      return res.status(400).send('Response already submitted.');
    }

    const newResponse = new Response({ agreementId, userId, response });
    await newResponse.save();

    agreement.responses.push(newResponse);
    await agreement.save();

    if (!response) {
      // If the response is 'false' (disagree), delete the agreement
      await Agreement.findByIdAndRemove(agreementId);
    }

    res.status(201).send('Response submitted successfully.');
  } catch (err) {
    res.status(400).send('Failed to submit response.');
    console.log(err);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
