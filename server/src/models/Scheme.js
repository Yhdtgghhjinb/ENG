const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    label: { type: String, required: true, trim: true },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

SchemeSchema.index({ branchId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Scheme', SchemeSchema);

