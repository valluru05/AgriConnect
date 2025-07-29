const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Get current user's profile
router.get('/me', auth, userController.getProfile);

// Update current user's profile
router.patch('/me', auth, userController.updateProfile);

module.exports = router; 