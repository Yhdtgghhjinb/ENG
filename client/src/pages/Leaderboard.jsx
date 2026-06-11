import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../config/api';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [userProfile, setUserProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/gamification/leaderboard?period=${period}&limit=20`);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewProfile = async (userName) => {
    try {
      const res = await api.get(`/api/gamification/profile/${encodeURIComponent(userName)}`);
      setUserProfile(res.data);
      setShowProfile(true);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const periods = [
    { value: 'all', label: 'All Time', icon: '🏆' },
    { value: 'month', label: 'This Month', icon: '📅' },
    { value: 'week', label: 'This Week', icon: '⚡' },
  ];

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankColor = (index) => {
    if (index === 0) return 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    if (index === 1) return 'linear-gradient(135deg, #94a3b8, #64748b)';
    if (index === 2) return 'linear-gradient(135deg, #f97316, #ea580c)';
    return 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
          🏆 Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto px-2">
          Top contributors in the VTU Vault community
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {periods.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: period === p.value 
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
                : 'rgba(255,255,255,0.05)',
              border: period === p.value
                ? '1px solid rgba(99,102,241,0.4)'
                : '1px solid rgba(255,255,255,0.1)',
              color: period === p.value ? 'white' : '#94a3b8',
              boxShadow: period === p.value ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
            }}>
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="text-sm text-slate-400 mt-4">Loading leaderboard...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <span className="text-4xl">🏆</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Rankings Yet</h3>
          <p className="text-sm text-slate-500">Be the first to contribute and earn points!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user, idx) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => viewProfile(user.name)}
              className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              style={{
                background: getRankColor(idx),
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: idx < 3 ? '0 4px 20px rgba(99,102,241,0.2)' : 'none',
              }}>
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold"
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  {getRankIcon(idx)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white truncate">{user.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ 
                        background: 'rgba(99,102,241,0.2)', 
                        color: '#a5b4fc',
                        border: '1px solid rgba(99,102,241,0.3)',
                      }}>
                      Level {user.level}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
                      <span>{user.points} pts</span>
                    </div>
                    {user.badges && user.badges.length > 0 && (
                      <div className="flex items-center gap-1">
                        {user.badges.slice(0, 3).map((badge, i) => (
                          <span key={i} title={badge.name}>{badge.icon}</span>
                        ))}
                        {user.badges.length > 3 && (
                          <span className="text-[10px]">+{user.badges.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-xs text-slate-400">
                  <div className="text-center">
                    <div className="font-bold text-white text-sm">{user.contributions?.discussionsStarted || 0}</div>
                    <div>Discussions</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-white text-sm">{user.contributions?.repliesPosted || 0}</div>
                    <div>Replies</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-white text-sm">{user.contributions?.helpfulVotes || 0}</div>
                    <div>Helpful</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* User Profile Modal */}
      {showProfile && userProfile && (
        <div 
          className="fixed inset-0 z-[9999] flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setShowProfile(false)}
        >
          <div 
            className="w-full max-w-2xl my-8 rounded-2xl p-6" 
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.95))',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Profile Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 text-3xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                }}>
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{userProfile.name}</h2>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-sm font-bold"
                  style={{ 
                    background: 'rgba(99,102,241,0.2)', 
                    color: '#a5b4fc',
                    border: '1px solid rgba(99,102,241,0.3)',
                  }}>
                  Level {userProfile.level}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-bold"
                  style={{ 
                    background: 'rgba(245,158,11,0.2)', 
                    color: '#fbbf24',
                    border: '1px solid rgba(245,158,11,0.3)',
                  }}>
                  ⭐ {userProfile.points} Points
                </span>
              </div>
            </div>

            {/* Badges */}
            {userProfile.badges && userProfile.badges.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-400 mb-3">Badges Earned</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {userProfile.badges.map((badge, i) => (
                    <div key={i} className="rounded-xl p-3 text-center"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}>
                      <div className="text-3xl mb-1">{badge.icon}</div>
                      <div className="text-xs font-semibold text-white">{badge.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contributions */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 mb-3">Contributions</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4"
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)',
                  }}>
                  <div className="text-2xl font-bold text-indigo-400 mb-1">
                    {userProfile.contributions?.discussionsStarted || 0}
                  </div>
                  <div className="text-xs text-slate-400">Discussions Started</div>
                </div>
                <div className="rounded-xl p-4"
                  style={{
                    background: 'rgba(139,92,246,0.1)',
                    border: '1px solid rgba(139,92,246,0.2)',
                  }}>
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {userProfile.contributions?.repliesPosted || 0}
                  </div>
                  <div className="text-xs text-slate-400">Replies Posted</div>
                </div>
                <div className="rounded-xl p-4"
                  style={{
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}>
                  <div className="text-2xl font-bold text-emerald-400 mb-1">
                    {userProfile.contributions?.helpfulVotes || 0}
                  </div>
                  <div className="text-xs text-slate-400">Helpful Votes</div>
                </div>
                <div className="rounded-xl p-4"
                  style={{
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}>
                  <div className="text-2xl font-bold text-amber-400 mb-1">
                    {userProfile.contributions?.resourcesShared || 0}
                  </div>
                  <div className="text-xs text-slate-400">Resources Shared</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowProfile(false)}
              className="w-full mt-6 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
