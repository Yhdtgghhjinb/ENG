const express = require('express');
const Branch = require('../models/Branch');
const Scheme = require('../models/Scheme');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');

const router = express.Router();

// Get branches
router.get('/branches', async (req, res, next) => {
  try {
    let branches = await Branch.find().sort({ name: 1 }).lean();

    // Backward-compatible fallback from Resource documents
    if (!branches.length) {
      const branchNames = await Resource.distinct('branch');
      branches = branchNames.map((name) => ({
        _id: name,
        name,
        code: name,
      }));
    }

    res.json(branches);
  } catch (err) {
    next(err);
  }
});

// Get schemes by branch
router.get('/branches/:branchId/schemes', async (req, res, next) => {
  try {
    const { branchId } = req.params;
    let schemes = await Scheme.find({ branchId }).sort({ year: 1 }).lean();

    if (!schemes.length) {
      const branch = await Branch.findById(branchId).lean();
      const branchName = branch?.name || branchId;
      const years = await Resource.distinct('year', { branch: branchName });
      schemes = years
        .sort((a, b) => a - b)
        .map((year) => ({
          _id: `${branchName}-${year}`,
          year,
          label: `${year} Scheme`,
          branchId,
        }));
    }

    res.json(schemes);
  } catch (err) {
    next(err);
  }
});

// Get semesters
router.get('/branches/:branchId/schemes/:schemeId/semesters', async (req, res, next) => {
  try {
    const { branchId, schemeId } = req.params;
    let semesters = await Semester.find({ branchId, schemeId })
      .sort({ number: 1 })
      .lean();

    if (!semesters.length) {
      const branch = await Branch.findById(branchId).lean();
      const scheme = await Scheme.findById(schemeId).lean();
      const branchName = branch?.name || branchId;
      const schemeYear = scheme?.year || Number(String(schemeId).match(/\d+/)?.[0]);
      const nums = await Resource.distinct('semester', {
        branch: branchName,
        year: schemeYear,
      });

      semesters = nums.sort((a, b) => a - b).map((number) => ({
        _id: `${branchName}-${schemeYear}-sem-${number}`,
        number,
        branchId,
        schemeId,
      }));
    }

    res.json(semesters);
  } catch (err) {
    next(err);
  }
});

// Get subjects
router.get(
  '/branches/:branchId/schemes/:schemeId/semesters/:semesterNumber/subjects',
  async (req, res, next) => {
    try {
      const { branchId, schemeId, semesterNumber } = req.params;
      const semNum = Number(semesterNumber);

      // Primary: normalized Subject collection
      const semesterDoc = await Semester.findOne({ branchId, schemeId, number: semNum }).lean();
      let subjects = [];

      if (semesterDoc) {
        subjects = await Subject.find({ semesterId: semesterDoc._id }).sort({ name: 1 }).lean();
      }

      // Fallback: derive from Resource
      if (!subjects.length) {
        const branch = await Branch.findById(branchId).lean();
        const scheme = await Scheme.findById(schemeId).lean();
        const branchName = branch?.name || branchId;
        const schemeYear = scheme?.year || Number(String(schemeId).match(/\d+/)?.[0]);
        const resources = await Resource.find({
          branch: branchName,
          year: schemeYear,
          semester: semNum,
        })
          .select('subject subjectCode')
          .lean();

        const seen = new Map();
        resources.forEach((r, index) => {
          const key = `${r.subject}-${r.subjectCode || ''}`;
          if (!seen.has(key)) {
            seen.set(key, {
              _id: key,
              name: r.subject,
              code: r.subjectCode || `21${String(branchName).slice(0, 2).toUpperCase()}${40 + index}`,
              branchId,
              schemeId,
            });
          }
        });
        subjects = [...seen.values()];
      }

      res.json(subjects);
    } catch (err) {
      next(err);
    }
  }
);

// Get resources by subject
router.get('/subjects/:subjectId', async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const subject = await Subject.findById(subjectId).lean();
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (err) {
    next(err);
  }
});

// Get resources by subject — STRICT: only resources belonging to this exact subject
router.get('/subjects/:subjectId/resources', async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { type, q } = req.query;

    // Validate subject exists
    const subject = await Subject.findById(subjectId).lean();
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    // Strict filter — only resources linked to this subjectId
    const query = { subjectId };
    if (type) query.type = type;
    if (q) {
      query.$or = [
        { title:       { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    next(err);
  }
});

// Live search (subjects/resources)
router.get('/search', async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const query = String(q).trim();
    if (!query) return res.json({ subjects: [], resources: [] });

    const subjects = await Subject.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { code: { $regex: query, $options: 'i' } },
      ],
    })
      .limit(8)
      .lean();

    const resources = await Resource.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { subject: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    })
      .limit(8)
      .lean();

    res.json({ subjects, resources });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

