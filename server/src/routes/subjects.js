/**
 * /api/subjects — public subject + resource endpoints
 */

const express  = require('express');
const mongoose = require('mongoose');
const Subject  = require('../models/Subject');
const Resource = require('../models/Resource');

const router = express.Router();

const VALID_TYPES = [
  'notes', 'pyq', 'model', 'textbook', 'lab', 'important', 'assignment',
  'reference', 'handout', 'supplementary', 'question-bank', 'syllabus', 'other',
];

// ── GET /api/subjects/:subjectId/counts ───────────────────────────────────────
// Fast endpoint to get resource counts by type (for initial page load)
router.get('/:subjectId/counts', async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, message: 'Invalid subjectId' });
    }

    // Use MongoDB aggregation for fast counts
    const counts = await Resource.aggregate([
      { $match: { subjectId: mongoose.Types.ObjectId(subjectId) } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    VALID_TYPES.forEach(type => { countMap[type] = 0; });
    counts.forEach(item => { countMap[item._id] = item.count; });

    // Total count
    const total = counts.reduce((sum, item) => sum + item.count, 0);

    res.json({
      success: true,
      total,
      counts: countMap,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/resources/:resourceId/download ──────────────────────────────────
router.post('/resources/:resourceId/download', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.resourceId)) {
      return res.status(400).json({ success: false });
    }
    await Resource.findByIdAndUpdate(
      req.params.resourceId,
      { $inc: { downloadCount: 1 } },
      { new: false }
    );
    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
});

// ── GET /api/subjects/:subjectId/resources ────────────────────────────────────
// Returns a fully structured response:
//   notes    → { modules: [{moduleNumber, unitTitle, resources}], general: [] }
//   pyq      → flat array
//   model    → flat array
//   textbook → flat array
//   lab      → flat array
//   important→ flat array
//   assignment → flat array
//   reference  → flat array
//   handout  → single resource or null
//   other    → flat array (supplementary, question-bank, syllabus, other)
// PAGINATION: ?section=notes&page=1&limit=20
router.get('/:subjectId/resources', async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { type, q, sort = 'newest', section, page = 1, limit = 50 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, message: 'Invalid subjectId format' });
    }

    const subject = await Subject.findById(subjectId)
      .select('name code branchId schemeId semesterId')
      .lean();

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const filter = { subjectId };

    // Section-specific loading (lazy load optimization)
    if (section) {
      if (!VALID_TYPES.includes(section)) {
        return res.status(400).json({ success: false, message: `Invalid section. Must be one of: ${VALID_TYPES.join(', ')}` });
      }
      filter.type = section;
    } else if (type) {
      if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({ success: false, message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` });
      }
      filter.type = type;
    }

    if (q && String(q).trim()) {
      const escaped = String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title:       { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
    }

    const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, title: { title: 1 } };
    const sortOrder = sortMap[sort] || sortMap.newest;

    // Pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalCount = await Resource.countDocuments(filter);

    // Fetch paginated resources
    const resources = await Resource.find(filter)
      .select('title description type fileUrl tags moduleNumber unitTitle semesterNumber subjectName subjectCode branchName schemeName downloadCount createdAt')
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // ── Build structured response ─────────────────────────────────────────

    // Notes: group by moduleNumber
    const notesAll = resources.filter(r => r.type === 'notes');
    const moduleMap = {};
    const notesGeneral = [];

    for (const r of notesAll) {
      if (r.moduleNumber != null) {
        if (!moduleMap[r.moduleNumber]) moduleMap[r.moduleNumber] = [];
        moduleMap[r.moduleNumber].push(r);
      } else {
        notesGeneral.push(r);
      }
    }

    const noteModules = Object.keys(moduleMap)
      .map(Number)
      .sort((a, b) => a - b)
      .map(num => ({
        moduleNumber: num,
        // Use the first resource's unitTitle as the module title if available
        unitTitle: moduleMap[num][0]?.unitTitle || '',
        resources: moduleMap[num],
      }));

    // Handout: return the most recent one (or null)
    const handoutAll = resources.filter(r => r.type === 'handout');
    const handout = handoutAll[0] || null;

    // Flat sections
    const pick = (t) => resources.filter(r => r.type === t);

    // "Other" bucket: supplementary, question-bank, syllabus, other
    const otherTypes = ['supplementary', 'question-bank', 'syllabus', 'other'];
    const other = resources.filter(r => otherTypes.includes(r.type));

    // Backward-compat flat list + module arrays
    const allModuleResources = [...notesAll.filter(r => r.moduleNumber != null)];
    const general = notesGeneral; // notes without module

    const modules = noteModules; // alias for backward compat

    // Pagination metadata
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
      hasPrevPage: pageNum > 1,
    };

    res.json({
      success: true,
      subject: { _id: subject._id, name: subject.name, code: subject.code },
      total:     resources.length,
      totalCount: totalCount,
      type:      section || type || 'all',
      pagination,

      // ── Structured sections ──────────────────────────────────────────────
      notes: {
        modules:  noteModules,
        general:  notesGeneral,
        total:    notesAll.length,
      },
      pyq:        pick('pyq'),
      model:      pick('model'),
      textbook:   pick('textbook'),
      lab:        pick('lab'),
      important:  pick('important'),
      assignment: pick('assignment'),
      reference:  pick('reference'),
      handout,
      other,

      // ── Backward-compat flat fields ──────────────────────────────────────
      resources, // paginated list
      modules,   // notes grouped by module (alias)
      general,   // notes without moduleNumber
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/subjects/:subjectId/full ─────────────────────────────────────────
router.get('/:subjectId/full', async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, message: 'Invalid subjectId' });
    }

    const subject = await Subject.findById(subjectId)
      .populate('branchId',   'name code')
      .populate('schemeId',   'label year')
      .populate('semesterId', 'number')
      .lean();

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const resources = await Resource.find({ subjectId })
      .select('title description type fileUrl moduleNumber unitTitle downloadCount createdAt')
      .sort({ moduleNumber: 1, createdAt: -1 })
      .lean();

    const moduleMap = {};
    const general   = [];

    for (const r of resources.filter(r => r.type === 'notes')) {
      if (r.moduleNumber != null) {
        if (!moduleMap[r.moduleNumber]) moduleMap[r.moduleNumber] = [];
        moduleMap[r.moduleNumber].push(r);
      } else {
        general.push(r);
      }
    }

    const modules = Object.keys(moduleMap)
      .map(Number)
      .sort((a, b) => a - b)
      .map(num => ({ moduleNumber: num, unitTitle: moduleMap[num][0]?.unitTitle || '', resources: moduleMap[num] }));

    const recommended = await Resource.find({
      semesterId: subject.semesterId._id,
      subjectId:  { $ne: subject._id },
    })
      .select('title type fileUrl subjectName downloadCount createdAt')
      .sort({ downloadCount: -1 })
      .limit(6)
      .lean();

    res.json({
      success: true,
      subject,
      resources,
      modules,
      general,
      recommended,
      totalResources: resources.length,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/subjects/:subjectId/recommendations ──────────────────────────────
router.get('/:subjectId/recommendations', async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, message: 'Invalid subjectId' });
    }

    const subject = await Subject.findById(subjectId)
      .select('name code branchId schemeId semesterId')
      .lean();

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const SELECT = 'title type fileUrl subjectName subjectCode semesterNumber branchName downloadCount createdAt';

    const [sameSubjectOtherTypes, sameSemesterOtherSubjects, recentlyAdded] = await Promise.all([
      Resource.find({ subjectId, type: { $ne: 'notes' } })
        .select(SELECT).sort({ createdAt: -1 }).limit(8).lean(),
      Resource.find({ semesterId: subject.semesterId, branchId: subject.branchId, subjectId: { $ne: subject._id } })
        .select(SELECT).sort({ createdAt: -1 }).limit(8).lean(),
      Resource.find({ branchId: subject.branchId, subjectId: { $ne: subject._id } })
        .select(SELECT).sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    res.json({
      success: true,
      subject: { _id: subject._id, name: subject.name, code: subject.code },
      recommendations: {
        sameSubjectOtherTypes:     { label: 'More from this Subject',       items: sameSubjectOtherTypes },
        sameSemesterOtherSubjects: { label: 'Other Subjects this Semester', items: sameSemesterOtherSubjects },
        recentlyAdded:             { label: 'Recently Added',               items: recentlyAdded },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
