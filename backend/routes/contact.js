const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    await ContactMessage.create({ name, email, message });
    res.json({ message: 'Message received! Thank you for contacting us.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save message.' });
  }
});

// GET /api/contact (admin)
router.get('/', async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
});

module.exports = router; 