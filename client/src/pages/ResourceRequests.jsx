import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../config/api';

const ResourceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    requestedBy: '',
    resourceType: 'notes',
    subjectName: '',
    branchName: '',
    semester: '',
    moduleNumber: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('vtuVaultUser') || '');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    setLoading(true);
    api.get('/api/resource-requests')
      .then(res => setRequests(res.data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/resource-requests', form);
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        requestedBy: '',
        resourceType: 'notes',
        subjectName: '',
        branchName: '',
        semester: '',
        moduleNumber: ''
      });
      loadRequests();
    } catch (err) {
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (requestId) => {
    if (!userName) {
      const name = prompt('Enter your name to vote:');
      if (!name) return;
      setUserName(name);
      localStorage.setItem('vtuVaultUser', name);
    }

    try {
      await api.post(`/api/resource-requests/${requestId}/vote`, { voterName: userName });
      loadRequests();
    } catch (err) {
      if (err.response?.status === 400) {
        alert(err.response.data.message);
      }
    }
  };

  const resourceTypes = [
    { value: 'notes', label: 'Notes', icon: '📝', color: '#6366f1' },
    { value: 'pyq', label: 'Question Papers', icon: '📄', color: '#8b5cf6' },
    { value: 'lab', label: 'Lab Programs', icon: '💻', color: '#ec4899' },
    { value: 'syllabus', label: 'Syllabus', icon: '📋', color: '#10b981' },
    { value: 'textbook', label: 'Textbook', icon: '📚', color: '#f59e0b' },
    { value: 'other', label: 'Other', icon: '📦', color: '#8b5cf6' },
  ];

  const statusColors = {
    pending: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', label: 'Pending' },
    'in-progress': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'In Progress' },
    fulfilled: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: '✓ Fulfilled' },
    rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Rejected' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">Resource Requests</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto px-2">
          Request missing resources and vote for what you need most
        </p>
      </div>

      {/* Request Button */}
      <div className="flex justify-end">
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
          Request Resource
        </button>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 z-[9999] flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setShowForm(false)}
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
            <h3 className="text-xl font-bold text-white mb-6">Request a Resource</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Your Name *</label>
                <input
                  type="text"
                  value={form.requestedBy}
                  onChange={e => setForm(f => ({ ...f, requestedBy: e.target.value }))}
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
                <label className="block text-sm font-semibold text-slate-300 mb-2">Resource Type *</label>
                <select
                  value={form.resourceType}
                  onChange={e => setForm(f => ({ ...f, resourceType: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  {resourceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  placeholder="e.g., Data Structures Module 3 Notes"
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
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                  rows="4"
                  placeholder="Describe what you need in detail..."
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Subject Name</label>
                  <input
                    type="text"
                    value={form.subjectName}
                    onChange={e => setForm(f => ({ ...f, subjectName: e.target.value }))}
                    placeholder="e.g., Data Structures"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Branch</label>
                  <input
                    type="text"
                    value={form.branchName}
                    onChange={e => setForm(f => ({ ...f, branchName: e.target.value }))}
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Semester</label>
                  <select
                    value={form.semester}
                    onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Module</label>
                  <select
                    value={form.moduleNumber}
                    onChange={e => setForm(f => ({ ...f, moduleNumber: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                    <option value="">Select Module</option>
                    {[1,2,3,4,5].map(mod => (
                      <option key={mod} value={mod}>Module {mod}</option>
                    ))}
                  </select>
                </div>
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
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="text-sm text-slate-400 mt-4">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Requests Yet</h3>
          <p className="text-sm text-slate-500 mb-4">Be the first to request a resource!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request, idx) => {
            const type = resourceTypes.find(t => t.value === request.resourceType) || resourceTypes[0];
            const status = statusColors[request.status] || statusColors.pending;
            
            return (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl p-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                <div className="flex items-start gap-4">
                  {/* Vote Button */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleVote(request._id)}
                      className="p-2 rounded-lg hover:bg-indigo-500/20 transition-all"
                      style={{ color: type.color }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 15l-6-6-6 6"/>
                      </svg>
                    </button>
                    <span className="text-lg font-bold text-white">{request.votes}</span>
                    <span className="text-[10px] text-slate-500">votes</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl">{type.icon}</span>
                        <h3 className="text-base font-bold text-white">{request.title}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{request.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {request.subjectName && (
                        <span className="px-2 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.15)' }}>
                          📚 {request.subjectName}
                        </span>
                      )}
                      {request.semester && (
                        <span>Sem {request.semester}</span>
                      )}
                      {request.moduleNumber && (
                        <span>Module {request.moduleNumber}</span>
                      )}
                      {request.branchName && (
                        <span>• {request.branchName}</span>
                      )}
                      <span>• by {request.requestedBy}</span>
                      <span>• {new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResourceRequests;
