const User = require('../models/User');
const Crop = require('../models/Crop');
const Order = require('../models/Order');

// Get all pending farmers (not verified)
exports.getPendingFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer', isVerified: false });
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Approve a farmer (set isVerified: true)
exports.approveFarmer = async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id);
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    farmer.isVerified = true;
    await farmer.save();
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reject a farmer (delete user)
exports.rejectFarmer = async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id);
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    await farmer.deleteOne();
    res.json({ message: 'Farmer rejected and deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all approved farmers (isVerified: true)
exports.getApprovedFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer', isVerified: true });
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all consumers
exports.getAllConsumers = async (req, res) => {
  try {
    const consumers = await User.find({ role: 'consumer' });
    res.json(consumers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get platform analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer', isVerified: true, isActive: true });
    const totalConsumers = await User.countDocuments({ role: 'consumer' });
    const totalOrders = await Order.countDocuments();
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const totalCrops = await Crop.countDocuments();
    const pendingCrops = await Crop.countDocuments({ isApproved: false });
    const approvedCrops = await Crop.countDocuments({ isApproved: true });
    res.json({
      totalUsers,
      totalFarmers,
      totalConsumers,
      totalOrders,
      totalRevenue,
      totalCrops,
      approvedCrops,
      pendingCrops
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Deactivate a user (set isActive: false)
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = false;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Activate a user (set isActive: true)
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = true;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Edit user details (name, email, role)
exports.editUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { name, email, role } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 