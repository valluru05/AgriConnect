const Crop = require('../models/Crop');
const User = require('../models/User');

// Add a new crop (Farmer)
exports.addCrop = async (req, res) => {
  try {
    const { name, quantity, price, discountPercent, harvestDate } = req.body;
    const farmer = req.user.id;
    let photos = [];
    if (req.file) {
      // Save the uploaded file path as the photo URL (relative to /uploads)
      photos = ["/uploads/" + req.file.filename];
    } else if (req.body.photos) {
      photos = Array.isArray(req.body.photos) ? req.body.photos : [req.body.photos];
    }
    const crop = new Crop({
      farmer,
      name,
      quantity,
      price,
      discountPercent,
      harvestDate,
      photos
    });
    await crop.save();
    const cropObj = crop.toObject();
    if (crop.discountPercent) {
      cropObj.discountedPrice = crop.price * (1 - crop.discountPercent / 100);
    }
    res.status(201).json(cropObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all crops (public, with optional filters)
exports.getCrops = async (req, res) => {
  try {
    const { priceMin, priceMax, type, district, village, pinCode, isApproved } = req.query;
    let filter = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (priceMin) filter.price = { ...filter.price, $gte: Number(priceMin) };
    if (priceMax) filter.price = { ...filter.price, $lte: Number(priceMax) };
    if (type) filter.name = { $regex: type, $options: 'i' };
    // Location filter (populate farmer)
    let crops = await Crop.find(filter).populate('farmer', 'name location');
    if (district) crops = crops.filter(c => c.farmer.location.district === district);
    if (village) crops = crops.filter(c => c.farmer.location.village === village);
    if (pinCode) crops = crops.filter(c => c.farmer.location.pinCode === pinCode);
    const cropsWithDiscount = crops.map(crop => {
      const obj = crop.toObject();
      if (obj.discountPercent) {
        obj.discountedPrice = obj.price * (1 - obj.discountPercent / 100);
      }
      return obj;
    });
    res.json(cropsWithDiscount);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get crops by farmer (Farmer dashboard)
exports.getFarmerCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ farmer: req.user.id });
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update crop (Farmer)
exports.updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    Object.assign(crop, req.body);
    if (req.file) {
      crop.photos = ["/uploads/" + req.file.filename];
    } else if (req.body.photos) {
      crop.photos = Array.isArray(req.body.photos) ? req.body.photos : [req.body.photos];
    }
    // Remove discountPercent if null/undefined/empty string
    if ('discountPercent' in req.body) {
      if (req.body.discountPercent === null || req.body.discountPercent === undefined || req.body.discountPercent === '') {
        crop.discountPercent = undefined;
      } else {
        crop.discountPercent = req.body.discountPercent;
      }
    }
    await crop.save();
    const cropObj = crop.toObject();
    if (crop.discountPercent) {
      cropObj.discountedPrice = crop.price * (1 - crop.discountPercent / 100);
    }
    res.json(cropObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete crop (Farmer)
exports.deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json({ message: 'Crop deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Approve or reject crop (Admin)
exports.approveCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    crop.isApproved = req.body.isApproved;
    await crop.save();
    res.json(crop);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reject (delete) a crop (Admin)
exports.rejectCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndDelete(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json({ message: 'Crop rejected and deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Restock a crop (Farmer)
exports.restockCrop = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid restock amount.' });
    const crop = await Crop.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    crop.quantity += amount;
    await crop.save();
    res.json(crop);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 