const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');

// Get all discussions
router.get('/', async (req, res, next) => {
  try {
    const { topic, subjectId } = req.query;
    const filter = { isActive: true };
    
    if (topic && topic !== 'all') filter.topic = topic;
    if (subjectId) filter.subjectId = subjectId;

    const discussions = await Discussion.find(filter)
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    res.json(discussions);
  } catch (err) {
    next(err);
  }
});

// Get single discussion
router.get('/:id', async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('subjectId', 'name code');
    
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Increment views
    discussion.views += 1;
    await discussion.save();

    res.json(discussion);
  } catch (err) {
    next(err);
  }
});

// Create discussion (public - no auth for now)
router.post('/', async (req, res, next) => {
  try {
    const discussion = new Discussion(req.body);
    await discussion.save();
    res.status(201).json(discussion);
  } catch (err) {
    next(err);
  }
});

// Add reply to discussion
router.post('/:id/replies', async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    discussion.replies.push(req.body);
    await discussion.save();
    res.status(201).json(discussion);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
