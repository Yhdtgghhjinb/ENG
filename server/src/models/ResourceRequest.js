const mongoose = require('mongoose');

const ResourceRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requestedBy: { type: String, required: true, trim: true },
    
    // What they're requesting
    resourceType: {
      type: String,
      enum: ['notes', 'pyq', 'lab', 'syllabus', 'textbook', 'other'],
      required: true
    },
    
    // Context
    subjectName: { type: String, trim: true },
    branchName: { type: String, trim: true },
    semester: { type: Number, min: 1, max: 8 },
    moduleNumber: { type: Number, min: 1, max: 5 },
    
    // Voting & engagement
    votes: { type: Number, default: 0 },
    votedBy: [{ type: String }], // Track who voted (by name/ID to prevent duplicates)
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'fulfilled', 'rejected'],
      default: 'pending'
    },
    
    // When fulfilled
    fulfilledBy: { type: String, trim: true },
    fulfilledResourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    },
    fulfilledAt: { type: Date },
    
    // Admin notes
    adminNotes: { type: String },
    
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for efficient queries
ResourceRequestSchema.index({ status: 1, votes: -1, createdAt: -1 });
ResourceRequestSchema.index({ branchName: 1, semester: 1 });
ResourceRequestSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('ResourceRequest', ResourceRequestSchema);
