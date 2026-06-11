const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, sparse: true, unique: true }, // Optional email
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ 
    badgeId: String,
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  contributions: {
    resourcesShared: { type: Number, default: 0 },
    discussionsStarted: { type: Number, default: 0 },
    repliesPosted: { type: Number, default: 0 },
    helpfulVotes: { type: Number, default: 0 },
    resourceRequestsFilled: { type: Number, default: 0 }
  },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

// Calculate level based on points
userSchema.pre('save', function(next) {
  this.level = Math.floor(this.points / 100) + 1;
  next();
});

module.exports = mongoose.model('User', userSchema);
