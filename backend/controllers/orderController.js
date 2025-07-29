const Order = require('../models/Order');
const Crop = require('../models/Crop');
const User = require('../models/User');

// Place a new order (Consumer)
exports.placeOrder = async (req, res) => {
  try {
    const { farmer, crops, orderType, deliveryAddress } = req.body; // crops: [{ crop, quantity }]
    if (!farmer || !crops || !Array.isArray(crops) || crops.length === 0) {
      return res.status(400).json({ message: 'Farmer and crops are required.' });
    }
    if (!orderType || !['Pickup', 'Delivery'].includes(orderType)) {
      return res.status(400).json({ message: 'Order type must be Pickup or Delivery.' });
    }
    if (orderType === 'Delivery') {
      if (!deliveryAddress || !deliveryAddress.address || !deliveryAddress.city || !deliveryAddress.postalCode || !deliveryAddress.contactNumber) {
        return res.status(400).json({ message: 'All delivery address fields are required.' });
      }
    }
    // Calculate totalAmount and check stock
    let totalAmount = 0;
    for (const item of crops) {
      const crop = await Crop.findById(item.crop);
      if (!crop || !crop.isApproved) {
        return res.status(400).json({ message: 'Invalid or unapproved crop.' });
      }
      if (item.quantity > crop.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${crop.name}. Only ${crop.quantity} kg available.` });
      }
      totalAmount += crop.price * item.quantity;
    }
    // Reduce crop quantities
    for (const item of crops) {
      await Crop.findByIdAndUpdate(item.crop, { $inc: { quantity: -item.quantity } });
    }
    const order = new Order({
      consumer: req.user.id,
      farmer,
      crops,
      totalAmount,
      orderType,
      deliveryAddress: orderType === 'Delivery' ? deliveryAddress : undefined,
      pickupStatus: orderType === 'Pickup' ? 'Not Ready' : undefined
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get orders for consumer
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ consumer: req.user.id }).populate('farmer crops.crop');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get orders for farmer
exports.getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user.id }).populate('consumer crops.crop');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('consumer farmer crops.crop');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update order status (Farmer or Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Only farmer of this order or admin can update
    if (req.user.role === 'farmer' && order.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update pickup status (Farmer)
exports.updatePickupStatus = async (req, res) => {
  try {
    const { pickupStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.orderType !== 'Pickup') return res.status(400).json({ message: 'Not a pickup order' });
    if (req.user.role !== 'farmer' || order.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    order.pickupStatus = pickupStatus;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get order invoice (HTML)
exports.getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('consumer farmer crops.crop');
    if (!order) return res.status(404).send('Order not found');
    let cropsHtml = order.crops.map(c => `<tr><td>${c.crop?.name || ''}</td><td>${c.quantity} kg</td><td>₹${c.crop?.price || ''}</td><td>₹${(c.crop?.price || 0) * c.quantity}</td></tr>`).join('');
    res.send(`
      <html><head><title>Invoice - ${order._id}</title></head><body style="font-family:sans-serif;max-width:600px;margin:2rem auto;padding:2rem;border:1px solid #ccc;">
        <h1 style="color:#14532d;">AgriConnect Invoice</h1>
        <hr/>
        <div><b>Order ID:</b> ${order._id}</div>
        <div><b>Date:</b> ${order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</div>
        <div><b>Status:</b> ${order.status}</div>
        <div><b>Order Type:</b> ${order.orderType}</div>
        <div><b>Consumer:</b> ${order.consumer?.name || ''} (${order.consumer?.email || ''})</div>
        <div><b>Farmer:</b> ${order.farmer?.name || ''} (${order.farmer?.email || ''})</div>
        <h2>Crops</h2>
        <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;">
          <thead><tr><th>Name</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr></thead>
          <tbody>${cropsHtml}</tbody>
        </table>
        <h2>Total: ₹${order.totalAmount}</h2>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send('Server error');
  }
}; 