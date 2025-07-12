const express = require('express');
const { body, validationResult } = require('express-validator');
const Swap = require('../models/Swap');
const Item = require('../models/Item');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create swap request
router.post('/', auth, [
  body('itemRequested').isMongoId(),
  body('itemOffered').optional().isMongoId(),
  body('pointsOffered').optional().isInt({ min: 0 }),
  body('message').optional().trim(),
  body('swapType').isIn(['direct', 'points'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemRequested, itemOffered, pointsOffered, message, swapType } = req.body;

    // Check if requested item exists and is available
    const requestedItem = await Item.findById(itemRequested);
    if (!requestedItem || !requestedItem.isAvailable) {
      return res.status(404).json({ message: 'Item not available for swap' });
    }

    // Check if user is not trying to swap their own item
    if (requestedItem.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot swap your own item' });
    }

    // For direct swaps, check if offered item exists and belongs to user
    if (swapType === 'direct') {
      if (!itemOffered) {
        return res.status(400).json({ message: 'Item to offer is required for direct swaps' });
      }

      const offeredItem = await Item.findById(itemOffered);
      if (!offeredItem || offeredItem.owner.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: 'Invalid item offered' });
      }

      if (!offeredItem.isAvailable) {
        return res.status(400).json({ message: 'Offered item is not available' });
      }
    }

    // For point-based swaps, check if user has enough points
    if (swapType === 'points') {
      if (!pointsOffered || pointsOffered < requestedItem.pointsValue) {
        return res.status(400).json({ 
          message: `Must offer at least ${requestedItem.pointsValue} points for this item` 
        });
      }

      if (req.user.points < pointsOffered) {
        return res.status(400).json({ message: 'Insufficient points' });
      }
    }

    // Check if there's already a pending swap for this item
    const existingSwap = await Swap.findOne({
      itemRequested,
      requester: req.user._id,
      status: 'pending'
    });

    if (existingSwap) {
      return res.status(400).json({ message: 'You already have a pending swap for this item' });
    }

    const swap = new Swap({
      requester: req.user._id,
      itemRequested,
      itemOffered,
      pointsOffered,
      message,
      swapType
    });

    await swap.save();

    // Populate the swap with item and user details
    await swap.populate([
      { path: 'itemRequested', populate: { path: 'owner', select: 'name' } },
      { path: 'itemOffered', populate: { path: 'owner', select: 'name' } },
      { path: 'requester', select: 'name' }
    ]);

    res.status(201).json(swap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's swaps (as requester)
router.get('/my-requests', auth, async (req, res) => {
  try {
    const swaps = await Swap.find({ requester: req.user._id })
      .populate([
        { path: 'itemRequested', populate: { path: 'owner', select: 'name' } },
        { path: 'itemOffered', populate: { path: 'owner', select: 'name' } }
      ])
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get swaps for user's items (as owner)
router.get('/my-items', auth, async (req, res) => {
  try {
    const userItems = await Item.find({ owner: req.user._id });
    const itemIds = userItems.map(item => item._id);

    const swaps = await Swap.find({ itemRequested: { $in: itemIds } })
      .populate([
        { path: 'itemRequested', populate: { path: 'owner', select: 'name' } },
        { path: 'itemOffered', populate: { path: 'owner', select: 'name' } },
        { path: 'requester', select: 'name email' }
      ])
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept swap
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('itemRequested')
      .populate('itemOffered')
      .populate('requester');

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Check if user owns the requested item
    if (swap.itemRequested.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap is not pending' });
    }

    // Update swap status
    swap.status = 'accepted';
    swap.completedAt = new Date();
    await swap.save();

    // Handle the exchange
    if (swap.swapType === 'direct') {
      // Direct swap: exchange items
      await Item.findByIdAndUpdate(swap.itemRequested._id, { 
        isAvailable: false,
        status: 'swapped'
      });
      await Item.findByIdAndUpdate(swap.itemOffered._id, { 
        isAvailable: false,
        status: 'swapped'
      });
    } else {
      // Point-based swap
      await Item.findByIdAndUpdate(swap.itemRequested._id, { 
        isAvailable: false,
        status: 'redeemed'
      });

      // Transfer points
      await User.findByIdAndUpdate(swap.requester._id, {
        $inc: { points: -swap.pointsOffered }
      });
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: swap.pointsOffered }
      });
    }

    res.json(swap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject swap
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('itemRequested');

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    if (swap.itemRequested.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap is not pending' });
    }

    swap.status = 'rejected';
    await swap.save();

    res.json(swap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel swap (by requester)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    if (swap.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel non-pending swap' });
    }

    swap.status = 'cancelled';
    await swap.save();

    res.json(swap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get swap by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate([
        { path: 'itemRequested', populate: { path: 'owner', select: 'name location' } },
        { path: 'itemOffered', populate: { path: 'owner', select: 'name location' } },
        { path: 'requester', select: 'name email' }
      ]);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    res.json(swap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 