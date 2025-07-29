const Review = require('../models/Review');
const Order = require('../models/Order');

// Add a review (consumer)
exports.addReview = async (req, res) => {
  try {
    const { farmer, crop, order, rating, comment } = req.body;
    // Check if consumer has a delivered order for this crop/farmer
    const hasOrder = await Order.findOne({
      _id: order || undefined,
      consumer: req.user.id,
      farmer,
      'crops.crop': crop,
      status: 'Delivered'
    });
    if (!hasOrder) return res.status(400).json({ message: 'You can only review after delivery.' });
    // Check if a review already exists for this order, crop, and consumer
    const existingReview = await Review.findOne({
      consumer: req.user.id,
      farmer,
      crop,
      order: hasOrder._id
    });
    if (existingReview) return res.status(400).json({ message: 'You have already reviewed this order.' });
    const review = new Review({
      consumer: req.user.id,
      farmer,
      crop,
      order: hasOrder._id,
      rating,
      comment
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get reviews (by farmer or crop)
exports.getReviews = async (req, res) => {
  try {
    const { farmer, crop } = req.query;
    let filter = {};
    if (farmer) filter.farmer = farmer;
    if (crop) filter.crop = crop;
    const reviews = await Review.find(filter).populate('consumer', 'name').sort({ createdAt: -1 });
    // Always include the order field in the response
    const reviewsWithOrder = reviews.map(r => ({
      ...r.toObject(),
      order: r.order?.toString()
    }));
    res.json(reviewsWithOrder);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 