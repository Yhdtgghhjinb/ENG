const express  = require('express');
const Resource = require('../models/Resource');

const router = express.Router();

// GET /api/resources — list with optional filters + keyword search
router.get('/', async (req, res, next) => {
  try {
    const { scheme, branch, year, semester, subject, type, q } = req.query;
    const query = {};

    if (scheme)   query.scheme   = scheme;
    if (branch)   query.branch   = branch;
    if (year)     query.year     = Number(year);
    if (semester) query.semester = Number(semester);
    if (subject)  query.subject  = subject;
    if (type)     query.type     = type;
    if (q) {
      query.$or = [
        { title:       { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { subject:     { $regex: q, $options: 'i' } },
        { scheme:      { $regex: q, $options: 'i' } },
        { branch:      { $regex: q, $options: 'i' } },
        { tags:        { $in: [new RegExp(q, 'i')] } },
      ];
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    next(err);
  }
});

// GET /api/resources/search — keyword search (semantic removed)
router.get('/search', async (req, res, next) => {
  try {
    const { query, scheme, branch, year, semester, subject, type } = req.query;
    const q = String(query || '').trim();

    if (!q) {
      return res.status(400).json({ success: false, message: 'query is required' });
    }

    const queryObj = {};
    if (scheme)   queryObj.scheme   = scheme;
    if (branch)   queryObj.branch   = branch;
    if (year)     queryObj.year     = Number(year);
    if (semester) queryObj.semester = Number(semester);
    if (subject)  queryObj.subject  = subject;
    if (type)     queryObj.type     = type;

    queryObj.$or = [
      { title:       { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { subject:     { $regex: q, $options: 'i' } },
      { scheme:      { $regex: q, $options: 'i' } },
      { branch:      { $regex: q, $options: 'i' } },
      { tags:        { $in: [new RegExp(q, 'i')] } },
    ];

    const resources = await Resource.find(queryObj).sort({ createdAt: -1 });

    return res.json({ success: true, mode: 'keyword', query: q, resources });
  } catch (err) {
    next(err);
  }
});

// GET /api/resources/facets
router.get('/facets', async (req, res, next) => {
  try {
    const { scheme, branch, year, semester } = req.query;
    const baseFilter = {};
    if (scheme)   baseFilter.scheme   = scheme;
    if (branch)   baseFilter.branch   = branch;
    if (year)     baseFilter.year     = Number(year);
    if (semester) baseFilter.semester = Number(semester);

    const [schemes, branches, years, semesters, subjects, types] = await Promise.all([
      Resource.distinct('scheme'),
      Resource.distinct('branch',   baseFilter),
      Resource.distinct('year',     baseFilter),
      Resource.distinct('semester', baseFilter),
      Resource.distinct('subject',  baseFilter),
      Resource.distinct('type',     baseFilter),
    ]);

    res.json({ schemes, branches, years: years.sort((a, b) => a - b), semesters: semesters.sort((a, b) => a - b), subjects, types });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
