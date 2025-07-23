const uuid = require('node-uuid');
const express = require('express');
const session = require('express-session');
const onHeaders = require('on-headers');
const RedisStore = require('connect-redis')(session);

// about 5KB
const basicInfo = require('./basic-info');

const app = express();

const getUserInfo = () => Object.assign({
  name: uuid.v4(),
}, basicInfo);

app.use(session({
  store: new RedisStore({
    ttl: 3600,
  }),
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || 'default_secret', // Use environment variable
  name: 'sessionId', // Custom session cookie name
  cookie: {
    httpOnly: true, // Mitigate XSS
    secure: process.env.NODE_ENV === 'production', // Ensure HTTPS
    maxAge: 3600000, // Set expiration for persistent cookies
    path: '/', // Define path for cookie
    domain: 'example.com', // Define domain for cookie
  },
}));

app.get('/user', (req, res) => {
  if (!req.session.user) {
    console.info('Create new session');
    req.session.user = getUserInfo();
  }
  res.json(req.session.user);
});

app.get('/foods', (req, res) => {
  res.json([]);
});

app.listen(7000);
console.info('Get user information from http://127.0.0.1:7000/user');
