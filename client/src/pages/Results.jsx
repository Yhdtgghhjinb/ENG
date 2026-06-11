import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';

const Results = () => {
  const [usn, setUsn] = useState('');
  const [examCode, setExamCode] = useState('latest');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [availableExams, setAvailableExams] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch available exam options
    api.get('/api/results/available')
      .then(res => {
        if (res.data.available && res.data.available.length > 0) {
          setAvailableExams(res.data.available);
        }
      })
      .catch(err => {
        console.error('Failed to fetch available exams:', err);
      });
  }, []);

  const handleFetchResult = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!usn) {
      setError('Please enter your USN');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/results/fetch', {
        usn: usn.toUpperCase(),
        examCode
      });

      if (response.data.success) {
        setResult(response.data);
        if (response.data.isDemo) {
          setError('Note: Displaying demo results. VTU portal may be unavailable.');
        }
      } else {
        setError(response.data.message || 'No results found for this USN');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (total) => {
    if (!total || total === 'N/A' || total === 'Absent' || total === 'AB') return 'N/A';
    const num = parseInt(total);
    if (isNaN(num)) return 'N/A';
    return ((num / 100) * 100).toFixed(1) + '%';
  };

  const getGradeColor = (result) => {
    if (!result || result === 'N/A') return '#64748b';
    if (result === 'P' || result === 'PASS') return '#10b981';
    if (result === 'F' || result === 'FAIL') return '#ef4444';
    return '#f59e0b';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
          VTU Results
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Check your live exam results and previous semester scores
        </p>
      </div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
          border: '1px solid rgba(99,102,241,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <form onSubmit={handleFetchResult} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* USN Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                University Seat Number (USN)
              </label>
              <input
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value.toUpperCase())}
                placeholder="e.g., 1AB20CS001"
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl text-white font-mono text-sm transition-all"
                style={{
                  background: 'rgba(15,23,42,0.6)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(99,102,241,0.6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(99,102,241,0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter your 10-character USN (e.g., 1AB20CS001)
              </p>
            </div>

            {/* Exam Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Select Exam
              </label>
              <select
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm transition-all"
                style={{
                  background: 'rgba(15,23,42,0.6)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  outline: 'none',
                }}
              >
                <option value="latest">Latest Results</option>
                {availableExams.map(exam => (
                  <option key={exam.examCode} value={exam.examCode}>
                    {exam.examName}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Choose the exam session
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !usn}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Fetching Results...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Get Results
              </span>
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 rounded-xl"
            style={{
              background: error.includes('demo') || error.includes('Note') 
                ? 'rgba(245,158,11,0.1)' 
                : 'rgba(239,68,68,0.1)',
              border: `1px solid ${error.includes('demo') || error.includes('Note') ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            <p className="text-sm" style={{ color: error.includes('demo') || error.includes('Note') ? '#fbbf24' : '#ef4444' }}>
              {error}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Results Display */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Student Info Card */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))',
                border: '1px solid rgba(16,185,129,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{result.studentName}</h2>
                  <p className="text-sm text-slate-400">USN: {result.usn}</p>
                  {result.examName && (
                    <p className="text-xs text-slate-500 mt-1">Exam: {result.examName}</p>
                  )}
                </div>
                <div className="flex gap-4">
                  {result.sgpa && result.sgpa !== 'N/A' && (
                    <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(16,185,129,0.2)' }}>
                      <p className="text-xs text-slate-400">SGPA</p>
                      <p className="text-2xl font-bold text-emerald-400">{result.sgpa}</p>
                    </div>
                  )}
                  {result.cgpa && result.cgpa !== 'N/A' && (
                    <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.2)' }}>
                      <p className="text-xs text-slate-400">CGPA</p>
                      <p className="text-2xl font-bold text-purple-400">{result.cgpa}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subjects Table */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid rgba(99,102,241,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-300 uppercase tracking-wider">Internal</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-300 uppercase tracking-wider">External</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-300 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-300 uppercase tracking-wider">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.subjects.map((subject, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-mono text-slate-400">{subject.code}</td>
                        <td className="px-4 py-3 text-sm text-white">{subject.name}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-slate-300">{subject.internal}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-slate-300">{subject.external}</td>
                        <td className="px-4 py-3 text-sm text-center font-bold text-white">{subject.total}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold"
                            style={{
                              background: `${getGradeColor(subject.result)}20`,
                              color: getGradeColor(subject.result),
                              border: `1px solid ${getGradeColor(subject.result)}40`,
                            }}
                          >
                            {subject.result}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Source Info */}
            {result.source && (
              <div className="text-center">
                <p className="text-xs text-slate-500">
                  Source: {result.source === 'VTU_OFFICIAL' ? '🌐 VTU Official Results Portal' : '🎯 Demo Data'}
                  {result.isDemo && ' • Live results will be fetched when VTU portal is available'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Section */}
      {!result && (
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'rgba(15,23,42,0.4)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: 'rgba(99,102,241,0.1)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.6)" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">How to Use</h3>
          <div className="text-sm text-slate-400 space-y-2 max-w-2xl mx-auto text-left">
            <p>• Enter your 10-character USN (e.g., 1AB20CS001)</p>
            <p>• Select the exam session you want to check</p>
            <p>• Click "Get Results" to fetch your scores</p>
            <p>• Results are fetched directly from VTU's official portal</p>
            <p>• View your subject-wise marks, SGPA, and CGPA</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
