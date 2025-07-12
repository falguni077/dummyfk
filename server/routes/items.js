const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all available items
router.get('/', async (req, res) => {
  try {
    const { category, type, size, search, page = 1, limit = 12 } = req.query;
    
    const query = { 
      status: 'approved', 
      isAvailable: true 
    };
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (size) query.size = size;
    if (search) {
      query.$text = { $search: search };
    }
    
    const items = await Item.find(query)
      .populate('owner', 'name location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Item.countDocuments(query);
    
    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured items (for carousel)
router.get('/featured', async (req, res) => {
  try {
    const items = await Item.find({ 
      status: 'approved', 
      isAvailable: true 
    })
    .populate('owner', 'name')
    .sort({ createdAt: -1 })
    .limit(6);
    
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name location bio');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new item
router.post('/', auth, upload.array('images', 5), [
  body('title').trim().isLength({ min: 3, max: 100 }),
  body('description').trim().isLength({ min: 10, max: 1000 }),
  body('category').isIn(['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other']),
  body('type').isIn(['casual', 'formal', 'sportswear', 'vintage', 'designer', 'other']),
  body('size').isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', 'Other']),
  body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']),
  body('pointsValue').isInt({ min: 10, max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }
    
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    const item = new Item({
      ...req.body,
      images: imageUrls,
      owner: req.user._id,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
    });
    
    await item.save();
    
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update item
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updateData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
      updateData.images = [...item.images, ...newImageUrls];
    }
    
    if (req.body.tags) {
      updateData.tags = req.body.tags.split(',').map(tag => tag.trim());
    }
    
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Item.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's items
router.get('/user/me', auth, async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 