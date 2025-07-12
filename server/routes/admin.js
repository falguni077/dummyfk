const express = require('express');
const Item = require('../models/Item');
const User = require('../models/User');
const Swap = require('../models/Swap');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all pending items for moderation
router.get('/items/pending', adminAuth, async (req, res) => {
  try {
    const items = await Item.find({ status: 'pending' })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve item
router.put('/items/:id/approve', adminAuth, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('owner', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject item
router.put('/items/:id/reject', adminAuth, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('owner', 'name email');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item (admin can remove any item)
router.delete('/items/:id', adminAuth, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get platform statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const pendingItems = await Item.countDocuments({ status: 'pending' });
    const approvedItems = await Item.countDocuments({ status: 'approved' });
    const totalSwaps = await Swap.countDocuments();
    const completedSwaps = await Swap.countDocuments({ status: 'accepted' });

    const stats = {
      totalUsers,
      totalItems,
      pendingItems,
      approvedItems,
      totalSwaps,
      completedSwaps,
      approvalRate: totalItems > 0 ? ((approvedItems / totalItems) * 100).toFixed(2) : 0,
      swapSuccessRate: totalSwaps > 0 ? ((completedSwaps / totalSwaps) * 100).toFixed(2) : 0
    };

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activity
router.get('/activity', adminAuth, async (req, res) => {
  try {
    const recentItems = await Item.find({})
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentSwaps = await Swap.find({})
      .populate('requester', 'name')
      .populate('itemRequested', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentUsers = await User.find({})
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      recentItems,
      recentSwaps,
      recentUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 