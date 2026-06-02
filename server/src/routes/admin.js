const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

const adminAuth = require('../middleware/adminAuth');
const Branch    = require('../models/Branch');
const Scheme    = require('../models/Scheme');
const Semester  = require('../models/Semester');
const Subject   = require('../models/Subject');
const Resource  = require('../models/Resource');

const router = express.Router();

// ── File upload ───────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error('Only PDF, DOC, DOCX, PPT, PPTX, ZIP files are allowed'));
  },
});

router.use(adminAuth);

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get('/stats', async (_req, res, next) => {
  try {
    const [branches, schemes, semesters, subjects, resources] = await Promise.all([
      Branch.countDocuments(), Scheme.countDocuments(),
      Semester.countDocuments(), Subject.countDocuments(), Resource.countDocuments(),
    ]);

    const [byType, byBranch, recentByDay, topSubjects, mostDownloaded, trendingSubjects, totalDownloads] = await Promise.all([
      Resource.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Resource.aggregate([{ $group: { _id: '$branchName', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Resource.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Resource.aggregate([
        { $group: { _id: '$subjectName', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 8 },
      ]),
      // Most downloaded resources
      Resource.find({ downloadCount: { $gt: 0 } })
        .select('title type subjectName branchName downloadCount')
        .sort({ downloadCount: -1 })
        .limit(10)
        .lean(),
      // Trending subjects by total downloads
      Resource.aggregate([
        { $match: { downloadCount: { $gt: 0 } } },
        { $group: { _id: '$subjectName', totalDownloads: { $sum: '$downloadCount' }, resourceCount: { $sum: 1 } } },
        { $sort: { totalDownloads: -1 } },
        { $limit: 8 },
      ]),
      // Total downloads across all resources
      Resource.aggregate([
        { $group: { _id: null, total: { $sum: '$downloadCount' } } },
      ]),
    ]);

    const totalDownloadCount = totalDownloads[0]?.total || 0;

    res.json({
      counts: { branches, schemes, semesters, subjects, resources, totalDownloads: totalDownloadCount },
      byType, byBranch, recentByDay, topSubjects,
      mostDownloaded, trendingSubjects,
    });
  } catch (err) { next(err); }
});

// ── Branches ──────────────────────────────────────────────────────────────────
router.get('/branches', async (_req, res, next) => {
  try { res.json(await Branch.find().sort({ name: 1 })); } catch (err) { next(err); }
});
router.post('/branches', async (req, res, next) => {
  try { res.status(201).json(await Branch.create(req.body)); } catch (err) { next(err); }
});
router.put('/branches/:id', async (req, res, next) => {
  try {
    const b = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!b) return res.status(404).json({ message: 'Not found' });
    res.json(b);
  } catch (err) { next(err); }
});
router.delete('/branches/:id', async (req, res, next) => {
  try { await Branch.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

// ── Schemes ───────────────────────────────────────────────────────────────────
router.get('/schemes', async (_req, res, next) => {
  try { res.json(await Scheme.find().populate('branchId', 'name code').sort({ year: -1 })); } catch (err) { next(err); }
});
router.post('/schemes', async (req, res, next) => {
  try { res.status(201).json(await Scheme.create(req.body)); } catch (err) { next(err); }
});
router.put('/schemes/:id', async (req, res, next) => {
  try {
    const s = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json(s);
  } catch (err) { next(err); }
});
router.delete('/schemes/:id', async (req, res, next) => {
  try { await Scheme.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

// ── Semesters ─────────────────────────────────────────────────────────────────
router.get('/semesters', async (_req, res, next) => {
  try {
    res.json(await Semester.find().populate('branchId', 'name code').populate('schemeId', 'label year').sort({ number: 1 }));
  } catch (err) { next(err); }
});
router.post('/semesters', async (req, res, next) => {
  try { res.status(201).json(await Semester.create(req.body)); } catch (err) { next(err); }
});
router.put('/semesters/:id', async (req, res, next) => {
  try {
    const s = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json(s);
  } catch (err) { next(err); }
});
router.delete('/semesters/:id', async (req, res, next) => {
  try { await Semester.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

// ── Subjects ──────────────────────────────────────────────────────────────────
router.get('/subjects', async (req, res, next) => {
  try {
    const { q, branchId, schemeId, semesterId, page = 1, limit = 200 } = req.query;
    const filter = {};
    if (q)          filter.name       = { $regex: q, $options: 'i' };
    if (branchId)   filter.branchId   = branchId;
    if (schemeId)   filter.schemeId   = schemeId;
    if (semesterId) filter.semesterId = semesterId;

    const total    = await Subject.countDocuments(filter);
    const subjects = await Subject.find(filter)
      .populate('branchId', 'name code')
      .populate('schemeId', 'label year')
      .populate('semesterId', 'number')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ subjects, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});
router.post('/subjects', async (req, res, next) => {
  try { res.status(201).json(await Subject.create(req.body)); } catch (err) { next(err); }
});
router.put('/subjects/:id', async (req, res, next) => {
  try {
    const s = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!s) return res.status(404).json({ message: 'Not found' });
    res.json(s);
  } catch (err) { next(err); }
});
router.delete('/subjects/:id', async (req, res, next) => {
  try { await Subject.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

// ── Resources — STRICT HIERARCHY ─────────────────────────────────────────────
router.get('/resources', async (req, res, next) => {
  try {
    const { q, type, subjectId, branchId, schemeId, semesterId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q)          filter.title      = { $regex: q, $options: 'i' };
    if (type)       filter.type       = type;
    if (subjectId)  filter.subjectId  = subjectId;
    if (branchId)   filter.branchId   = branchId;
    if (schemeId)   filter.schemeId   = schemeId;
    if (semesterId) filter.semesterId = semesterId;

    const total     = await Resource.countDocuments(filter);
    const resources = await Resource.find(filter)
      .populate('subjectId', 'name code')
      .populate('branchId',  'name code')
      .populate('schemeId',  'label year')
      .populate('semesterId','number')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ resources, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

/**
 * POST /api/admin/resources
 * Admin only provides: subjectId, title, type, description, file/fileUrl
 * Backend auto-fills: branchId, schemeId, semesterId + denormalised name fields
 */
router.post('/resources', upload.single('file'), async (req, res, next) => {
  try {
    const { subjectId, title, type, description, fileUrl: bodyUrl, tags } = req.body;

    if (!subjectId) return res.status(400).json({ message: 'subjectId is required' });

    // Resolve subject and its full hierarchy
    const subject = await Subject.findById(subjectId)
      .populate('branchId')
      .populate('schemeId')
      .populate('semesterId');

    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    // Determine file URL
    let fileUrl = bodyUrl;
    if (req.file) {
      const host = `${req.protocol}://${req.get('host')}`;
      fileUrl = `${host}/uploads/${req.file.filename}`;
    }
    if (!fileUrl) return res.status(400).json({ message: 'File upload or fileUrl is required' });

    // Check for duplicate (same subject + title + type)
    const existing = await Resource.findOne({ subjectId, title: title?.trim(), type });
    if (existing) return res.status(409).json({ message: 'A resource with this title and type already exists for this subject' });

    const { moduleNumber, unitTitle } = req.body;

    const resourceData = {
      title,
      description: description || '',
      type: type || 'notes',
      fileUrl,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      unitTitle: unitTitle || '',

      // Auto-filled from subject hierarchy — no manual input needed
      subjectId:  subject._id,
      semesterId: subject.semesterId._id,
      schemeId:   subject.schemeId._id,
      branchId:   subject.branchId._id,

      // Denormalised for fast display
      subjectName:    subject.name,
      subjectCode:    subject.code,
      semesterNumber: subject.semesterId.number,
      schemeName:     subject.schemeId.label,
      branchName:     subject.branchId.name,
      branchCode:     subject.branchId.code,
    };

    // moduleNumber: parse and include only if provided (skip validation for non-notes)
    if (moduleNumber != null && moduleNumber !== '') {
      resourceData.moduleNumber = Number(moduleNumber);
    }

    const resource = await Resource.create(resourceData);

    res.status(201).json(resource);
  } catch (err) { next(err); }
});

router.put('/resources/:id', upload.single('file'), async (req, res, next) => {
  try {
    const body = { ...req.body };
    // If subjectId changed, re-resolve hierarchy
    if (body.subjectId) {
      const subject = await Subject.findById(body.subjectId)
        .populate('branchId').populate('schemeId').populate('semesterId');
      if (!subject) return res.status(404).json({ message: 'Subject not found' });
      body.semesterId     = subject.semesterId._id;
      body.schemeId       = subject.schemeId._id;
      body.branchId       = subject.branchId._id;
      body.subjectName    = subject.name;
      body.subjectCode    = subject.code;
      body.semesterNumber = subject.semesterId.number;
      body.schemeName     = subject.schemeId.label;
      body.branchName     = subject.branchId.name;
      body.branchCode     = subject.branchId.code;
    }
    if (req.file) {
      const host = `${req.protocol}://${req.get('host')}`;
      body.fileUrl = `${host}/uploads/${req.file.filename}`;
    }
    // Parse moduleNumber if provided
    if (body.moduleNumber != null && body.moduleNumber !== '') {
      body.moduleNumber = Number(body.moduleNumber);
    } else if (body.moduleNumber === '') {
      body.moduleNumber = null;
    }
    const resource = await Resource.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!resource) return res.status(404).json({ message: 'Not found' });
    res.json(resource);
  } catch (err) { next(err); }
});

router.delete('/resources/:id', async (req, res, next) => {
  try { await Resource.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

module.exports = router;
