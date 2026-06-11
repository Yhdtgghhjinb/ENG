import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../config/api';

const Home = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await api.get('/api/vtu/branches');
        setBranches(res.data || []);
      } catch {
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };
    loadBranches();
  }, []);

  // Prefetch schemes when user hovers over branch
  const prefetchSchemes = async (branchId) => {
    try {
      await api.get(`/api/vtu/branches/${branchId}/schemes`);
      // Data is now cached for faster navigation
    } catch {
      // Silently fail
    }
  };

  const branchColors = [
    { from: 'rgba(99,102,241,0.4)', to: 'rgba(59,130,246,0.2)', icon: '🏗️' },
    { from: 'rgba(14,165,233,0.4)', to: 'rgba(6,182,212,0.2)', icon: '💻' },
    { from: 'rgba(16,185,129,0.4)', to: 'rgba(5,150,105,0.2)', icon: '⚡' },
    { from: 'rgba(168,85,247,0.4)', to: 'rgba(217,70,239,0.2)', icon: '🔬' },
    { from: 'rgba(245,158,11,0.4)', to: 'rgba(234,88,12,0.2)', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-3 py-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-base font-semibold text-white">Loading branches...</h3>
          <p className="text-xs text-slate-400">Getting latest data</p>
        </div>
        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl p-4 animate-pulse"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(59,130,246,0.05) 100%)',
                minHeight: '140px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-slate-700/50"></div>
                <div className="h-5 w-14 rounded-lg bg-slate-700/50"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-700/50"></div>
                <div className="h-3 w-1/2 rounded bg-slate-700/30"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hero Section - Clean Mobile */}
      <div className="text-center space-y-2 py-3">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">VTU VAULT</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Study materials, notes & resources by branch
        </p>
      </div>

      {/* Branch Cards - Clean Grid */}
      <div>
        <h2 className="text-sm sm:text-base font-semibold text-white mb-3">Engineering Branches</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {branches.map((branch, idx) => {
            const style = branchColors[idx % branchColors.length];
            return (
              <Link
                key={branch._id}
                to={`/home/branches/${encodeURIComponent(branch._id)}`}
                onMouseEnter={() => prefetchSchemes(branch._id)}
                className="group block rounded-xl p-4 transition-all duration-200 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${style.from} 0%, ${style.to} 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  minHeight: '140px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                      style={{ 
                        background: 'rgba(255,255,255,0.15)', 
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)' 
                      }}>
                      {style.icon}
                    </div>
                    {branch.code && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg"
                        style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          color: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(10px)' 
                        }}>
                        {branch.code}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-sm sm:text-base font-bold text-white mb-1 line-clamp-2 flex-1">
                    {branch.name}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-2 mt-auto border-t" 
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="text-[10px] text-white/70">View Schemes</span>
                    <span className="text-white transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
