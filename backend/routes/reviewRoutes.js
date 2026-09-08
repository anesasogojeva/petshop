const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Create a review (logged in)
router.post('/', authenticateToken,authorizeRole(['admin',  'veterinarian','user']), reviewController.createReview);

// Get all reviews
router.get('/', reviewController.getAllReviews);

// Get reviews for a specific product
router.get('/product/:productId', reviewController.getReviewsByProduct);

// Delete a review (user can delete their own)
router.delete('/:reviewId', authenticateToken,authorizeRole(['admin']), reviewController.deleteReview);

module.exports = router;