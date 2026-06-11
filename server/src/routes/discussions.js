const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');

// Get all discussions
router.get('/', async (req, res, next) => {
  try {
    const { topic, subjectId, sort = 'recent' } = req.query;
    const filter = { isActive: true };
    
    if (topic && topic !== 'all') filter.topic = topic;
    if (subjectId) filter.subjectId = subjectId;

    let sortOption = { isPinned: -1, createdAt: -1 }; // Default: pinned first, then newest
    
    if (sort === 'popular') sortOption = { isPinned: -1, upvotes: -1, views: -1 };
    if (sort === 'solved') sortOption = { isSolved: -1, createdAt: -1 };

    const discussions = await Discussion.find(filter)
      .populate('subjectId', 'name code')
      .sort(sortOption)
      .limit(50)
      .lean();
    
    res.json(discussions);
  } catch (err) {
    next(err);
  }
});

// Get single discussion with full details
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

// Create discussion
router.post('/', async (req, res, next) => {
  try {
    const discussion = new Discussion(req.body);
    await discussion.save();
    res.status(201).json(discussion);
  } catch (err) {
    next(err);
  }
});

// Upvote discussion
router.post('/:id/upvote', async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    discussion.upvotes += 1;
    await discussion.save();
    res.json({ upvotes: discussion.upvotes, downvotes: discussion.downvotes });
  } catch (err) {
    next(err);
  }
});

// Downvote discussion
router.post('/:id/downvote', async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    discussion.downvotes += 1;
    await discussion.save();
    res.json({ upvotes: discussion.upvotes, downvotes: discussion.downvotes });
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

// Upvote reply
router.post('/:id/replies/:replyId/upvote', async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    reply.upvotes += 1;
    await discussion.save();
    res.json(reply);
  } catch (err) {
    next(err);
  }
});

// Downvote reply
router.post('/:id/replies/:replyId/downvote', async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    reply.downvotes += 1;
    await discussion.save();
    res.json(reply);
  } catch (err) {
    next(err);
  }
});

// Mark reply as best answer
router.post('/:id/replies/:replyId/best', async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    
    // Remove best answer from all replies
    discussion.replies.forEach(reply => {
      reply.isBestAnswer = false;
    });
    
    // Mark this reply as best
    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    reply.isBestAnswer = true;
    discussion.isSolved = true;
    await discussion.save();
    res.json(discussion);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
