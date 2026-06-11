import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../config/api';

const QuestionPaperAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    semester: '',
    year: ''
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setAnalyzing(true);
    setError('');

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    formDataToSend.append('subject', formData.subject);
    formDataToSend.append('semester', formData.semester);
    formDataToSend.append('year', formData.year);

    try {
      const res = await api.post('/api/ai/analyze-paper', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze question paper');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
          🎯 Question Paper Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto px-2">
          Upload previous question papers to analyze patterns and get study recommendations
        </p>
      </div>

      {/* Upload Form */}
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Upload Area */}
          <div className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
              border: '2px dashed rgba(99,102,241,0.3)',
            }}>
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer py-8">
              <div className="w-16 h-16 mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.2)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p className="text-white font-semibold mb-1">
                {file ? file.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-slate-500">
                PDF, JPG, PNG or TXT (Max 10MB)
              </p>
            </label>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Subject Name</label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData(f => ({ ...f, subject: e.target.value }))}
                placeholder="e.g., Data Structures"
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Semester</label>
              <select
                value={formData.semester}
                onChange={e => setFormData(f => ({ ...f, semester: e.target.value }))}
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
              <label className="block text-sm font-semibold text-slate-300 mb-2">Year</label>
              <input
                type="text"
                value={formData.year}
                onChange={e => setFormData(f => ({ ...f, year: e.target.value }))}
                placeholder="e.g., 2023"
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || analyzing}
            className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: file && !analyzing ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
            }}>
            {analyzing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </span>
            ) : (
              '🔍 Analyze Question Paper'
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto space-y-4">
          
          {/* Success Message */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <p className="text-sm text-emerald-400">
              ✓ Analysis complete for: <span className="font-bold">{result.filename}</span>
            </p>
          </div>

          {result.message && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <p className="text-sm text-amber-400">{result.message}</p>
            </div>
          )}

          {result.analysis && (
            <>
              {/* Important Topics */}
              {result.analysis.topics && result.analysis.topics.length > 0 && (
                <div className="rounded-2xl p-6"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>📚</span> Important Topics Covered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-sm font-semibold"
                        style={{
                          background: 'rgba(99,102,241,0.2)',
                          color: '#a5b4fc',
                          border: '1px solid rgba(99,102,241,0.3)',
                        }}>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Types */}
              {result.analysis.questionTypes && result.analysis.questionTypes.length > 0 && (
                <div className="rounded-2xl p-6"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>📝</span> Question Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.questionTypes.map((type, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-sm font-semibold"
                        style={{
                          background: 'rgba(139,92,246,0.2)',
                          color: '#c4b5fd',
                          border: '1px solid rgba(139,92,246,0.3)',
                        }}>
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Difficulty Level */}
              {result.analysis.difficulty && (
                <div className="rounded-2xl p-6"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span>⚡</span> Difficulty Level
                  </h3>
                  <p className="text-2xl font-bold" style={{
                    color: result.analysis.difficulty === 'Easy' ? '#10b981' :
                           result.analysis.difficulty === 'Hard' ? '#ef4444' : '#f59e0b'
                  }}>
                    {result.analysis.difficulty}
                  </p>
                </div>
              )}

              {/* Study Recommendations */}
              {result.analysis.recommendations && result.analysis.recommendations.length > 0 && (
                <div className="rounded-2xl p-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>💡</span> Study Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {result.analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-emerald-400 mt-1">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary (if JSON parsing failed) */}
              {result.analysis.summary && (
                <div className="rounded-2xl p-6"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  <h3 className="text-lg font-bold text-white mb-4">Analysis Summary</h3>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {result.analysis.summary}
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Info Box */}
      <div className="max-w-3xl mx-auto rounded-2xl p-6"
        style={{
          background: 'rgba(99,102,241,0.05)',
          border: '1px solid rgba(99,102,241,0.1)',
        }}>
        <h4 className="text-sm font-bold text-white mb-2">💡 Tips for Best Results:</h4>
        <ul className="space-y-1 text-xs text-slate-400">
          <li>• Upload clear, readable question papers</li>
          <li>• Text files (.txt) provide the most accurate analysis</li>
          <li>• Add subject and semester details for better recommendations</li>
          <li>• Upload multiple papers to identify recurring patterns</li>
        </ul>
      </div>
    </div>
  );
};

export default QuestionPaperAnalyzer;
