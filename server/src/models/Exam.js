const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true, index: true },
    semester: { type: Number, min: 1, max: 8 },
    type: { 
      type: String, 
      enum: ['midterm', 'final', 'practical', 'viva', 'assignment', 'other'],
      default: 'other'
    },
    branch: { type: String, trim: true }, // Optional: specific branch
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for efficient queries
ExamSchema.index({ date: 1, isActive: 1 });

module.exports = mongoose.model('Exam', ExamSchema);
