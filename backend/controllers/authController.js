const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper: Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, district, village, pinCode } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }
    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });
    // Farmer must provide location
    let location = {};
    if (role === 'farmer') {
      if (!district || !village || !pinCode) {
        return res.status(400).json({ message: 'Farmers must provide district, village, and PIN code.' });
      }
      location = { district, village, pinCode };
    }
    const user = new User({ name, email, password, role, location });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        location: user.location
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated.' });
    // For farmers, check verification
    if (user.role === 'farmer' && !user.isVerified) {
      return res.status(403).json({ message: 'Farmer account not verified by admin.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        location: user.location
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 