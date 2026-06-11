import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../config/api';

const Discussions = () => {
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', topic: 'general', author: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadDiscussions = () => {
    setLoading(true);
    const params = selectedTopic !== 'all' ? { topic: selectedTopic } : {};
    api.get('/api/discussions', { params })
      .then(res => setDiscussions(res.data || []))
      .catch(() => setDiscussions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDiscussions();
  }, [selectedTopic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/discussions', form);
      setShowForm(false);
      setForm({ title: '', content: '', topic: 'general', author: '' });
      loadDiscussions();
    } catch (err) {
      alert('Failed to post discussion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const topics = [
    { id: 'all', name: 'All Topics', icon: '📚', color: '#6366f1' },
    { id: 'general', name: 'General', icon: '💬', color: '#8b5cf6' },
    { id: 'doubt', name: 'Doubts', icon: '❓', color: '#ec4899' },
    { id: 'study', name: 'Study Tips', icon: '📝', color: '#10b981' },
    { id: 'exam', name: 'Exam Prep', icon: '🎯', color: '#f59e0b' },
  ];

  const filteredDiscussions = discussions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-2">💬 Discussion Forum</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Ask questions, get answers, and connect with VTU students
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span className="hidden sm:inline">Start Discussion</span>
          <span className="sm:hidden">New</span>
        </button>
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

      {/* Discussion Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setShowForm(false)}
        >
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" 
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.95))',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-6">Start a Discussion</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Your Name *</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                  required
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Topic *</label>
                <select
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  <option value="general">General</option>
                  <option value="doubt">Doubts</option>
                  <option value="study">Study Tips</option>
                  <option value="exam">Exam Prep</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  placeholder="What's your question or topic?"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Description *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  required
                  rows="5"
                  placeholder="Explain your question or share your thoughts..."
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl font-semibold text-slate-400 transition-all hover:bg-slate-800"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    opacity: submitting ? 0.6 : 1,
                  }}>
                  {submitting ? 'Posting...' : 'Post Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          <button 
            onClick={() => setShowForm(true)}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105"
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
              onClick={() => navigate(`/home/discussions/${discussion._id}`)}
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
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{discussion.title}</h3>
                      {discussion.isSolved && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                          ✓ Solved
                        </span>
                      )}
                      {discussion.isPinned && (
                        <span className="text-amber-400">📌</span>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-xs text-slate-500">
                      {new Date(discussion.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">{discussion.content}</p>
                  
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 15l-6-6-6 6"/>
                      </svg>
                      {(discussion.upvotes || 0) - (discussion.downvotes || 0)}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {discussion.replies?.length || 0} replies
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
