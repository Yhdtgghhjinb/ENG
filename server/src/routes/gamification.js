const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserProfile, BADGES } = require('../services/gamification');

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all', limit = 10 } = req.query;
    const users = await getLeaderboard(period, parseInt(limit));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
  }
});

// Get user profile
router.get('/profile/:userName', async (req, res) => {
  try {
    const user = await getUserProfile(req.params.userName);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
});

// Get all available badges
router.get('/badges', (req, res) => {
  res.json(Object.values(BADGES));
});

module.exports = router;
