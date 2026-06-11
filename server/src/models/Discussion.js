const mongoose = require('mongoose');

const DiscussionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true, trim: true }, // Username or Anonymous
    topic: { 
      type: String, 
      enum: ['general', 'doubt', 'study', 'exam', 'other'],
      default: 'general'
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      index: true,
    },
    replies: [
      {
        author: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for efficient queries
DiscussionSchema.index({ topic: 1, isActive: 1, createdAt: -1 });
DiscussionSchema.index({ subjectId: 1, isActive: 1 });

module.exports = mongoose.model('Discussion', DiscussionSchema);
