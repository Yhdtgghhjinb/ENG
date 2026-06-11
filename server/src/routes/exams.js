const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');

// Get all active exams
router.get('/', async (req, res, next) => {
  try {
    const exams = await Exam.find({ isActive: true })
      .sort({ date: 1 })
      .lean();
    res.json(exams);
  } catch (err) {
    next(err);
  }
});

// Get upcoming exams
router.get('/upcoming', async (req, res, next) => {
  try {
    const now = new Date();
    const exams = await Exam.find({ 
      isActive: true,
      date: { $gte: now }
    })
      .sort({ date: 1 })
      .limit(10)
      .lean();
    res.json(exams);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
