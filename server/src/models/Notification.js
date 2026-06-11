const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['exam', 'resource', 'announcement', 'update'],
      default: 'announcement'
    },
    category: { type: String, trim: true }, // e.g., "Semester 5", "Computer Science"
    link: { type: String, trim: true }, // Optional link to resource/page
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date }, // Optional: auto-hide after date
    source: { 
      type: String, 
      enum: ['MANUAL', 'VTU_OFFICIAL'],
      default: 'MANUAL'
    }, // Track if notification is from VTU or manually created
    scrapedAt: { type: Date }, // When it was scraped from VTU
  },
  { timestamps: true }
);

// Index for efficient queries
NotificationSchema.index({ isActive: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
