import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await axios.get('/api/vtu/branches');
        setBranches(res.data || []);
      } catch {
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };
    loadBranches();
  }, []);

  const branchColors = [
    { from: 'rgba(99,102,241,0.4)', to: 'rgba(59,130,246,0.2)', icon: '🏗️' },
    { from: 'rgba(14,165,233,0.4)', to: 'rgba(6,182,212,0.2)', icon: '💻' },
    { from: 'rgba(16,185,129,0.4)', to: 'rgba(5,150,105,0.2)', icon: '⚡' },
    { from: 'rgba(168,85,247,0.4)', to: 'rgba(217,70,239,0.2)', icon: '🔬' },
    { from: 'rgba(245,158,11,0.4)', to: 'rgba(234,88,12,0.2)', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2 py-6">
          <div className="skeleton h-10 w-64 mx-auto rounded-xl" />
          <div className="skeleton h-6 w-96 mx-auto rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-44 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section - Mobile Optimized */}
      <div className="text-center space-y-2 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">StudyHub VTU Platform</h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl mx-auto px-2">
          Access study materials, notes, question papers, and resources by branch, scheme, and semester
        </p>
      </div>

      {/* Branch Cards - Fast & Clean */}
      <div>
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-3 sm:mb-4">Engineering Branches</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {branches.map((branch, idx) => {
            const style = branchColors[idx % branchColors.length];
            return (
              <Link
                key={branch._id}
                to={`/home/branches/${encodeURIComponent(branch._id)}`}
                className="group block rounded-xl p-4 sm:p-5 transition-all duration-200 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${style.from} 0%, ${style.to} 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  minHeight: '160px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg text-2xl"
                      style={{ 
                        background: 'rgba(255,255,255,0.15)', 
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)' 
                      }}>
                      {style.icon}
                    </div>
                    {branch.code && (
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-3 py-1 rounded-lg"
                        style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          color: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(10px)' 
                        }}>
                        {branch.code}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2 line-clamp-2 flex-1 leading-snug">
                    {branch.name}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-2 sm:pt-3 mt-auto border-t" 
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="text-[10px] sm:text-xs text-white/70">View Schemes</span>
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
