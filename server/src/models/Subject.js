const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
      index: true,
    },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true,
      index: true,
    },

    // ── Academic metadata ──────────────────────────────────────────────────
    credits:        { type: Number, default: null },
    lectureHours:   { type: Number, default: null },
    tutorialHours:  { type: Number, default: null },
    practicalHours: { type: Number, default: null },
    totalHours:     { type: Number, default: null },

    syllabus:          { type: String, default: '' },   // markdown / rich text
    courseObjectives:  [{ type: String, trim: true }],
    courseOutcomes:    [{ type: String, trim: true }],
    referenceBooks:    [{ type: String, trim: true }],
    courseHandoutUrl:  { type: String, default: '' },   // PDF link
  },
  { timestamps: true }
);

SubjectSchema.index({ semesterId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Subject', SubjectSchema);
