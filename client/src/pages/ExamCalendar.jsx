import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../config/api';

const ExamCalendar = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load exams from API
    api.get('/api/exams')
      .then(res => setExams(res.data || []))
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  }, []);

  const getTimeUntil = (dateStr) => {
    const examDate = new Date(dateStr);
    const now = new Date();
    const diff = examDate - now;
    
    if (diff < 0) return 'Completed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days`;
    if (hours > 0) return `${hours} hours`;
    return 'Today!';
  };

  const upcomingExams = exams.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastExams = exams.filter(e => new Date(e.date) < new Date()).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">VTU Exam Calendar</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto px-2">
          Stay updated with upcoming VTU exams, deadlines, and important dates
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="text-sm text-slate-400 mt-4">Loading exams...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Exams Scheduled</h3>
          <p className="text-sm text-slate-500">Exam dates will be added by administrators</p>
        </div>
      ) : (
        <>
          {/* Upcoming Exams */}
          {upcomingExams.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="flex h-2 w-2"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                Upcoming Exams
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingExams.map((exam, idx) => (
                  <motion.div
                    key={exam._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.05))',
                      border: '1px solid rgba(16,185,129,0.3)',
                      boxShadow: '0 4px 20px rgba(16,185,129,0.1)',
                    }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-white mb-1">{exam.title}</h3>
                        <p className="text-xs text-slate-400">{exam.description}</p>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-lg font-black text-emerald-400">{getTimeUntil(exam.date)}</div>
                        <div className="text-[10px] text-slate-500">remaining</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {exam.semester && (
                        <div className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                          Sem {exam.semester}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Past Exams */}
          {pastExams.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-400 mb-4">Past Exams</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastExams.slice(0, 4).map((exam, idx) => (
                  <div
                    key={exam._id}
                    className="rounded-2xl p-5 opacity-60"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                    <h3 className="text-sm font-bold text-slate-400 mb-1">{exam.title}</h3>
                    <p className="text-xs text-slate-600 mb-3">{exam.description}</p>
                    <div className="text-xs text-slate-600">
                      {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExamCalendar;
