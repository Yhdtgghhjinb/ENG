const User = require('../models/User');

// Points awarded for different actions
const POINTS = {
  RESOURCE_SHARED: 50,
  DISCUSSION_STARTED: 20,
  REPLY_POSTED: 10,
  HELPFUL_VOTE_RECEIVED: 5,
  RESOURCE_REQUEST_FILLED: 30,
  BEST_ANSWER: 25
};

// Badge definitions
const BADGES = {
  FIRST_CONTRIBUTION: { id: 'first_contribution', name: 'First Step', icon: '🎯', description: 'Made your first contribution' },
  KNOWLEDGE_SHARER: { id: 'knowledge_sharer', name: 'Knowledge Sharer', icon: '📚', description: 'Shared 10 resources' },
  DISCUSSION_STARTER: { id: 'discussion_starter', name: 'Discussion Starter', icon: '💬', description: 'Started 5 discussions' },
  HELPFUL_HERO: { id: 'helpful_hero', name: 'Helpful Hero', icon: '⭐', description: 'Received 50 helpful votes' },
  TOP_CONTRIBUTOR: { id: 'top_contributor', name: 'Top Contributor', icon: '🏆', description: 'Reached 500 points' },
  COMMUNITY_CHAMPION: { id: 'community_champion', name: 'Community Champion', icon: '👑', description: 'Reached 1000 points' },
  REPLY_MASTER: { id: 'reply_master', name: 'Reply Master', icon: '✍️', description: 'Posted 50 replies' },
  PROBLEM_SOLVER: { id: 'problem_solver', name: 'Problem Solver', icon: '🎓', description: 'Had 10 best answers' }
};

// Award points to user
async function awardPoints(userName, action, amount = null) {
  if (!userName) return;
  
  try {
    const pointsToAward = amount || POINTS[action] || 0;
    
    let user = await User.findOne({ name: userName });
    if (!user) {
      user = new User({ name: userName, points: 0 });
    }
    
    user.points += pointsToAward;
    user.lastActive = new Date();
    
    // Update contribution counts
    if (action === 'RESOURCE_SHARED') user.contributions.resourcesShared += 1;
    if (action === 'DISCUSSION_STARTED') user.contributions.discussionsStarted += 1;
    if (action === 'REPLY_POSTED') user.contributions.repliesPosted += 1;
    if (action === 'HELPFUL_VOTE_RECEIVED') user.contributions.helpfulVotes += 1;
    if (action === 'RESOURCE_REQUEST_FILLED') user.contributions.resourceRequestsFilled += 1;
    
    await user.save();
    
    // Check for new badges
    await checkAndAwardBadges(user);
    
    return user;
  } catch (error) {
    console.error('Error awarding points:', error);
  }
}

// Check and award badges based on achievements
async function checkAndAwardBadges(user) {
  const newBadges = [];
  
  // First contribution
  if (user.contributions.resourcesShared === 1 && !hasBadge(user, 'first_contribution')) {
    newBadges.push(BADGES.FIRST_CONTRIBUTION);
  }
  
  // Knowledge Sharer
  if (user.contributions.resourcesShared >= 10 && !hasBadge(user, 'knowledge_sharer')) {
    newBadges.push(BADGES.KNOWLEDGE_SHARER);
  }
  
  // Discussion Starter
  if (user.contributions.discussionsStarted >= 5 && !hasBadge(user, 'discussion_starter')) {
    newBadges.push(BADGES.DISCUSSION_STARTER);
  }
  
  // Helpful Hero
  if (user.contributions.helpfulVotes >= 50 && !hasBadge(user, 'helpful_hero')) {
    newBadges.push(BADGES.HELPFUL_HERO);
  }
  
  // Reply Master
  if (user.contributions.repliesPosted >= 50 && !hasBadge(user, 'reply_master')) {
    newBadges.push(BADGES.REPLY_MASTER);
  }
  
  // Top Contributor
  if (user.points >= 500 && !hasBadge(user, 'top_contributor')) {
    newBadges.push(BADGES.TOP_CONTRIBUTOR);
  }
  
  // Community Champion
  if (user.points >= 1000 && !hasBadge(user, 'community_champion')) {
    newBadges.push(BADGES.COMMUNITY_CHAMPION);
  }
  
  // Award new badges
  if (newBadges.length > 0) {
    for (const badge of newBadges) {
      user.badges.push({
        badgeId: badge.id,
        name: badge.name,
        icon: badge.icon,
        earnedAt: new Date()
      });
    }
    await user.save();
  }
  
  return newBadges;
}

// Check if user has a specific badge
function hasBadge(user, badgeId) {
  return user.badges.some(b => b.badgeId === badgeId);
}

// Get leaderboard
async function getLeaderboard(period = 'all', limit = 10) {
  let query = {};
  
  if (period === 'month') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    query.lastActive = { $gte: startOfMonth };
  } else if (period === 'week') {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    query.lastActive = { $gte: startOfWeek };
  }
  
  const users = await User.find(query)
    .sort({ points: -1 })
    .limit(limit)
    .select('name points level badges contributions lastActive');
  
  return users;
}

// Get user profile
async function getUserProfile(userName) {
  let user = await User.findOne({ name: userName });
  if (!user) {
    user = new User({ name: userName });
    await user.save();
  }
  return user;
}

module.exports = {
  awardPoints,
  getLeaderboard,
  getUserProfile,
  POINTS,
  BADGES
};
