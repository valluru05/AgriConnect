const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth, requireRole } = require('../middleware/auth');

// Add a review (consumer)
router.post('/', auth, requireRole('consumer'), reviewController.addReview);

// Get reviews (by farmer or crop)
router.get('/', reviewController.getReviews);

module.exports = router; 