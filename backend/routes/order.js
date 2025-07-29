const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, requireRole } = require('../middleware/auth');

// Place a new order (Consumer)
router.post('/', auth, requireRole('consumer'), orderController.placeOrder);

// Get my orders (Consumer)
router.get('/my', auth, requireRole('consumer'), orderController.getMyOrders);

// Get orders for farmer
router.get('/farmer', auth, requireRole('farmer'), orderController.getFarmerOrders);

// Get all orders (Admin)
router.get('/', auth, requireRole('admin'), orderController.getAllOrders);

// Update order status (Farmer or Admin)
router.patch('/:id/status', auth, orderController.updateOrderStatus);

// Update pickup status (Farmer)
router.patch('/:id/pickup-status', auth, requireRole('farmer'), orderController.updatePickupStatus);

// Get order invoice (HTML)
router.get('/:id/invoice', auth, orderController.getOrderInvoice);

module.exports = router; 