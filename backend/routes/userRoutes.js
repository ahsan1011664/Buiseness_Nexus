const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getEntrepreneurs } = require('../controllers/userController');

// Get all entrepreneurs
router.get('/entrepreneurs', auth, getEntrepreneurs);

module.exports = router; 