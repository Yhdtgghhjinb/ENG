import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../config/api';

const DiscussionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyForm, setReplyForm] = useState({ author: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDiscussion();
  }, [id]);

  const loadDiscussion = () => {
    api.get(`/api/discussions/${id}`)
      .then(res => setDiscussion(res.data))
      .catch(() => navigate('/home/discussions'))
      .finally(() => setLoading(false));
  };

  const handleVote = async (type) => {
    try {
      await api.post(`/api/discussions/${id}/${type}`);
      loadDiscussion();
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const handleReplyVote = async (replyId, type) => {
    try {
      await api.post(`/api/discussions/${id}/replies/${replyId}/${type}`);
      loadDiscussion();
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const handleMarkBest = async (replyId) => {
    try {
      await api.post(`/api/discussions/${id}/replies/${replyId}/best`);
      loadDiscussion();
    } catch (err) {
      console.error('Mark best failed:', err);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/api/discussions/${id}/replies`, replyForm);
      setReplyForm({ author: '', content: '' });
      loadDiscussion();
    } catch (err) {
      alert('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
      </div>
    );
  }

  if (!discussion) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/home/discussions')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to discussions
      </button>

      {/* Main Discussion */}
      <div className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
        <div className="flex items-start gap-4">
          {/* Voting */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleVote('upvote')}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>
            <span className="text-lg font-bold text-white">{discussion.upvotes - discussion.downvotes}</span>
            <button
              onClick={() => handleVote('downvote')}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {discussion.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white">{discussion.author}</p>
                <p className="text-xs text-slate-500">{new Date(discussion.createdAt).toLocaleDateString()}</p>
              </div>
              {discussion.isSolved && (
                <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                  ✓ Solved
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">{discussion.title}</h1>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{discussion.content}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
              <span>{discussion.replies?.length || 0} replies</span>
              <span>{discussion.views} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">{discussion.replies?.length || 0} Replies</h2>
        
        {discussion.replies?.map((reply, idx) => (
          <motion.div
            key={reply._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-2xl p-5"
            style={{
              background: reply.isBestAnswer 
                ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))'
                : 'rgba(255,255,255,0.03)',
              border: reply.isBestAnswer ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.05)',
            }}>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleReplyVote(reply._id, 'upvote')}
                  className="p-1 rounded hover:bg-white/5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                </button>
                <span className="text-sm font-bold">{(reply.upvotes || 0) - (reply.downvotes || 0)}</span>
                <button
                  onClick={() => handleReplyVote(reply._id, 'downvote')}
                  className="p-1 rounded hover:bg-white/5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                    {reply.author.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-semibold text-white">{reply.author}</p>
                  <p className="text-xs text-slate-500">{new Date(reply.createdAt).toLocaleDateString()}</p>
                  {reply.isBestAnswer && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                      ✓ Best Answer
                    </span>
                  )}
                </div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                {!discussion.isSolved && !reply.isBestAnswer && (
                  <button
                    onClick={() => handleMarkBest(reply._id)}
                    className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
                    Mark as best answer
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reply Form */}
      <div className="rounded-2xl p-6"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
        <h3 className="text-lg font-bold text-white mb-4">Your Reply</h3>
        <form onSubmit={handleSubmitReply} className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={replyForm.author}
            onChange={e => setReplyForm(f => ({ ...f, author: e.target.value }))}
            required
            className="w-full px-4 py-2.5 rounded-xl text-white text-sm"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
          <textarea
            placeholder="Write your reply..."
            value={replyForm.content}
            onChange={e => setReplyForm(f => ({ ...f, content: e.target.value }))}
            required
            rows="4"
            className="w-full px-4 py-2.5 rounded-xl text-white text-sm"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              opacity: submitting ? 0.6 : 1,
            }}>
            {submitting ? 'Posting...' : 'Post Reply'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DiscussionDetail;
