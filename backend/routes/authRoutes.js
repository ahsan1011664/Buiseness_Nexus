const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, verifyToken } = require('../controllers/authController');

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Verify token and get user data
router.get('/verify-token', auth, verifyToken);

module.exports = router; 