const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  author: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  isBestAnswer: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const DiscussionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true, trim: true },
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
    replies: [ReplySchema],
    views: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    isSolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual for reply count
DiscussionSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Index for efficient queries
DiscussionSchema.index({ topic: 1, isActive: 1, createdAt: -1 });
DiscussionSchema.index({ subjectId: 1, isActive: 1 });
DiscussionSchema.index({ isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Discussion', DiscussionSchema);
