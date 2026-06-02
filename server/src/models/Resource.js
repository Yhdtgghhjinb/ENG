const mongoose = require('mongoose');

/**
 * STRICT HIERARCHY: Resource → Subject → Semester → Scheme → Branch
 * All structural fields are auto-filled from the Subject on creation.
 */
const ResourceSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    fileUrl:     { type: String, required: true, trim: true },

    type: {
      type: String,
      required: true,
      enum: [
        'notes',          // Lecture notes — module-wise
        'pyq',            // Previous year question papers
        'model',          // Model question papers
        'textbook',       // Textbook / reference book
        'lab',            // Lab programs & manuals
        'important',      // Important questions
        'assignment',     // Assignments
        'reference',      // Reference material
        'handout',        // Course handout (single PDF per subject)
        // Legacy / extra
        'supplementary',
        'question-bank',
        'syllabus',
        'other',
      ],
      default: 'notes',
    },

    // ── Module-wise organisation (notes only) ─────────────────────────────
    moduleNumber: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
      validate: {
        validator: function (v) {
          // Required only when type === 'notes'
          if (this.type === 'notes' && v == null) return false;
          return true;
        },
        message: 'moduleNumber is required for notes type (1–5)',
      },
    },
    unitTitle: { type: String, trim: true, default: '' },

    // ── Strict refs (auto-filled from Subject on create) ──────────────────
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true,
      index: true,
    },
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },

    // ── Denormalised string copies for fast text filtering ─────────────────
    subjectName:    { type: String, trim: true },
    subjectCode:    { type: String, trim: true },
    semesterNumber: { type: Number },
    schemeName:     { type: String, trim: true },
    branchName:     { type: String, trim: true },
    branchCode:     { type: String, trim: true },

    tags: [{ type: String, trim: true }],

    // ── Download tracking ──────────────────────────────────────────────────
    downloadCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

ResourceSchema.index({ branchId: 1, schemeId: 1, semesterId: 1, subjectId: 1 });
ResourceSchema.index({ subjectId: 1, type: 1 });
ResourceSchema.index({ subjectId: 1, moduleNumber: 1 });
ResourceSchema.index({ downloadCount: -1 });

module.exports = mongoose.model('Resource', ResourceSchema);
