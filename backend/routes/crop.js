const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');
const { auth, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Add a new crop (Farmer)
router.post('/', auth, requireRole('farmer'), upload.single('photo'), cropController.addCrop);

// Get all crops (public, with filters)
router.get('/', cropController.getCrops);

// Get crops by farmer (Farmer dashboard)
router.get('/my', auth, requireRole('farmer'), cropController.getFarmerCrops);

// Update crop (Farmer)
router.put('/:id', auth, requireRole('farmer'), upload.single('photo'), cropController.updateCrop);

// Delete crop (Farmer)
router.delete('/:id', auth, requireRole('farmer'), cropController.deleteCrop);

// Approve/reject crop (Admin)
router.patch('/:id/approve', auth, requireRole('admin'), cropController.approveCrop);

// Reject (delete) a crop (Admin)
router.delete('/:id/reject', auth, requireRole('admin'), cropController.rejectCrop);

// Restock a crop (Farmer)
router.patch('/:id/restock', auth, requireRole('farmer'), cropController.restockCrop);

module.exports = router; 