const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const profileController = require('../controllers/profileController');

// Get recommended startups for investors
router.get('/startups/recommended', auth, profileController.getRecommendedStartups);

// Get recommended investors for entrepreneurs
router.get('/investors/recommended', auth, profileController.getRecommendedInvestors);

// Get all entrepreneurs (for investors)
router.get('/list/entrepreneurs', auth, profileController.getEntrepreneurs);

// Get all investors (for entrepreneurs)
router.get('/list/investors', auth, profileController.getInvestors);

// Update own profile
router.put('/', auth, profileController.updateProfile);

// Get user profile by ID
router.get('/:id', auth, profileController.getProfile);

module.exports = router; 