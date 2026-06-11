import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../config/api';

const Discussions = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('all');

  useEffect(() => {
    // Load discussions from API
    api.get('/api/discussions')
      .then(res => setDiscussions(res.data || []))
      .catch(() => setDiscussions([]))
      .finally(() => setLoading(false));
  }, []);

  const topics = [
    { id: 'all', name: 'All Topics', icon: '📚', color: '#6366f1' },
    { id: 'general', name: 'General', icon: '💬', color: '#8b5cf6' },
    { id: 'doubt', name: 'Doubts', icon: '❓', color: '#ec4899' },
    { id: 'study', name: 'Study Tips', icon: '📝', color: '#10b981' },
    { id: 'exam', name: 'Exam Prep', icon: '🎯', color: '#f59e0b' },
  ];

  const filteredDiscussions = selectedTopic === 'all' 
    ? discussions 
    : discussions.filter(d => d.topic === selectedTopic);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">Discussion Forum</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto px-2">
          Ask questions, share knowledge, and connect with fellow VTU students
        </p>
      </div>

      {/* Topic Filters */}
      <div className="flex flex-wrap gap-2">
        {topics.map(topic => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopic(topic.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: selectedTopic === topic.id 
                ? `${topic.color}20` 
                : 'rgba(255,255,255,0.03)',
              border: selectedTopic === topic.id
                ? `1px solid ${topic.color}40`
                : '1px solid rgba(255,255,255,0.05)',
              color: selectedTopic === topic.id ? topic.color : '#94a3b8',
            }}>
            <span>{topic.icon}</span>
            <span>{topic.name}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="text-sm text-slate-400 mt-4">Loading discussions...</p>
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Discussions Yet</h3>
          <p className="text-sm text-slate-500 mb-4">Be the first to start a discussion!</p>
          <button className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            }}>
            Start Discussion
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDiscussions.map((discussion, idx) => (
            <motion.div
              key={discussion._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  }}>
                  {discussion.author?.charAt(0)?.toUpperCase() || '?'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-white line-clamp-2">{discussion.title}</h3>
                    <span className="flex-shrink-0 text-xs text-slate-500">{discussion.time || '2h ago'}</span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">{discussion.content}</p>
                  
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {discussion.replies || 0} replies
                    </div>
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                      {discussion.views || 0} views
                    </div>
                    {discussion.topic && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: `${topics.find(t => t.id === discussion.topic)?.color || '#6366f1'}20`,
                          color: topics.find(t => t.id === discussion.topic)?.color || '#6366f1',
                        }}>
                        {topics.find(t => t.id === discussion.topic)?.name || discussion.topic}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Discussions;
