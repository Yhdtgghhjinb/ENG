const express = require('express');
const router = express.Router();
const ResourceRequest = require('../models/ResourceRequest');

// Get all resource requests
router.get('/', async (req, res, next) => {
  try {
    const { status = 'pending', sort = 'votes' } = req.query;
    const filter = { isActive: true };
    
    if (status !== 'all') filter.status = status;

    let sortOption = { votes: -1, createdAt: -1 }; // Default: most voted first
    if (sort === 'recent') sortOption = { createdAt: -1 };

    const requests = await ResourceRequest.find(filter)
      .populate('fulfilledResourceId', 'title type fileUrl')
      .sort(sortOption)
      .limit(100)
      .lean();
    
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// Get single request
router.get('/:id', async (req, res, next) => {
  try {
    const request = await ResourceRequest.findById(req.params.id)
      .populate('fulfilledResourceId', 'title type fileUrl');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (err) {
    next(err);
  }
});

// Create resource request
router.post('/', async (req, res, next) => {
  try {
    const request = new ResourceRequest(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});

// Vote for a request
router.post('/:id/vote', async (req, res, next) => {
  try {
    const { voterName } = req.body;
    
    if (!voterName) {
      return res.status(400).json({ message: 'Voter name is required' });
    }

    const request = await ResourceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if already voted
    if (request.votedBy.includes(voterName)) {
      return res.status(400).json({ message: 'You have already voted for this request' });
    }

    request.votes += 1;
    request.votedBy.push(voterName);
    await request.save();
    
    res.json({ votes: request.votes, hasVoted: true });
  } catch (err) {
    next(err);
  }
});

// Unvote (remove vote)
router.post('/:id/unvote', async (req, res, next) => {
  try {
    const { voterName } = req.body;
    
    if (!voterName) {
      return res.status(400).json({ message: 'Voter name is required' });
    }

    const request = await ResourceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if voted
    const index = request.votedBy.indexOf(voterName);
    if (index === -1) {
      return res.status(400).json({ message: 'You have not voted for this request' });
    }

    request.votes -= 1;
    request.votedBy.splice(index, 1);
    await request.save();
    
    res.json({ votes: request.votes, hasVoted: false });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
