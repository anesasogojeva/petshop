const { Op } = require('sequelize');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');

// Create a review
exports.createReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  try {
    // Create review
    const review = await Review.create({
      productId,
      userId,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, attributes: ['id', 'name'] },
        { model: Product, attributes: ['id', 'name'] }
      ]
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get reviews by product
exports.getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.findAll({
      where: { productId },
      include: [{ model: User, attributes: ['id', 'name'] }]
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch product reviews' });
  }
};

// Delete a review (if needed)
exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // If admin, find review by ID only. Otherwise, also match by userId.
    const whereClause = userRole === 'admin'
      ? { id: reviewId }
      : { id: reviewId, userId };

    const review = await Review.findOne({ where: whereClause });

    if (!review) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    await review.destroy();

    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

