const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const { expressjwt } = require('express-jwt');

const path = require('path');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
  next();
});

const PORT = 3000;

const secretKey = 'super secret key';

const authMiddleware = function (req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      err: 'No token provided',
    });
  }

  // Split the Authorization header to get the token part
  const tokenParts = authHeader.split(' ');

  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      err: 'Invalid token format',
    });
  }

  const token = tokenParts[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        err: 'Failed to authenticate token',
      });
    }

    next();
  });
};

let users = [
  {
    id: 1,
    username: 'clive',
    password: '1234',
  },
  {
    id: 2,
    username: 'fabio',
    password: '5678',
  },
];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username) {
      if (users[i].password === password) {
        let token = jwt.sign(
          { id: users[i].id, username: users[i].username },
          secretKey,
          { expiresIn: '3m' },
        );
        res.json({
          success: true,
          err: null,
          token,
        });
        break;
      } else {
        res.status(401).json({
          success: false,
          err: 'Username or password incorrect',
          token: null,
        });
      }
    }
  }
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({
    success: true,
    myContent: 'Welcome to the authorized members dashboard',
  });
});

app.get('/api/settings', authMiddleware, (req, res) => {
  res.json({
    success: true,
    myContent: 'Welcome to the settings page (protected)',
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
