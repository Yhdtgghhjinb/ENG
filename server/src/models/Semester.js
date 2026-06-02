const mongoose = require('mongoose');

const SemesterSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, min: 1, max: 8 },
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
  },
  { timestamps: true }
);

SemesterSchema.index({ schemeId: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Semester', SemesterSchema);

