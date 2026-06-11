const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get all active notifications
router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const notifications = await Notification.find({
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(100)
      .lean();
    
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

// Get notification by ID
router.get('/:id', async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
