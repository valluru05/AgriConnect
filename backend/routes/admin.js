const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, requireRole } = require('../middleware/auth');

// Get all pending farmers
router.get('/pending-farmers', auth, requireRole('admin'), adminController.getPendingFarmers);
// Approve a farmer
router.patch('/verify-farmer/:id', auth, requireRole('admin'), adminController.approveFarmer);
// Reject a farmer
router.delete('/reject-farmer/:id', auth, requireRole('admin'), adminController.rejectFarmer);
// Get all approved farmers
router.get('/approved-farmers', auth, requireRole('admin'), adminController.getApprovedFarmers);
// Get all consumers
router.get('/consumers', auth, requireRole('admin'), adminController.getAllConsumers);
// Deactivate a user
router.patch('/deactivate-user/:id', auth, requireRole('admin'), adminController.deactivateUser);
// Activate a user
router.patch('/activate-user/:id', auth, requireRole('admin'), adminController.activateUser);
// Edit user details
router.patch('/edit-user/:id', auth, requireRole('admin'), adminController.editUser);
// Delete a user
router.delete('/delete-user/:id', auth, requireRole('admin'), adminController.deleteUser);
// Get analytics
router.get('/analytics', auth, requireRole('admin'), adminController.getAnalytics);

module.exports = router; 