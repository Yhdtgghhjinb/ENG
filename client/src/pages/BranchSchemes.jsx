import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Breadcrumbs from '../components/Breadcrumbs';

const schemeColors = [
  { from: 'rgba(99,102,241,0.4)', to: 'rgba(79,70,229,0.2)', icon: '📐' },
  { from: 'rgba(14,165,233,0.4)', to: 'rgba(2,132,199,0.2)', icon: '🔭' },
  { from: 'rgba(217,70,239,0.4)', to: 'rgba(168,85,247,0.2)', icon: '⚗️' },
];

const BranchSchemes = () => {
  const { branchId } = useParams();
  const [schemes, setSchemes] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/vtu/branches/${branchId}/schemes`),
      axios.get(`/api/vtu/branches`),
    ]).then(([schemesRes, branchesRes]) => {
      setSchemes(schemesRes.data || []);
      const b = (branchesRes.data || []).find(x => String(x._id) === String(branchId));
      setBranchName(b?.name || b?.code || '');
    }).finally(() => setLoading(false));
  }, [branchId]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <Breadcrumbs items={[{ label: 'Home', to: '/home' }, { label: branchName || '…' }]} />

      <div className="rounded-xl p-4 sm:p-5" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">{branchName}</h2>
        <p className="text-xs sm:text-sm text-slate-400">Select curriculum scheme</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton rounded-xl" style={{ height: 160 }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {schemes.map((scheme, idx) => {
            const style = schemeColors[idx % schemeColors.length];
            return (
              <Link
                key={scheme._id}
                to={`/home/branches/${branchId}/schemes/${encodeURIComponent(scheme._id)}`}
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
                    <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg text-xl sm:text-2xl"
                      style={{ 
                        background: 'rgba(255,255,255,0.15)', 
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)' 
                      }}>
                      {style.icon}
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-3 py-1 rounded-lg"
                      style={{ 
                        background: 'rgba(255,255,255,0.2)', 
                        color: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)' 
                      }}>
                      Scheme
                    </span>
                  </div>
                  
                  <p className="text-4xl sm:text-5xl font-bold text-white mb-1 sm:mb-2">{scheme.label || scheme.year}</p>
                  <p className="text-[10px] sm:text-xs text-white/70 mb-3">Curriculum Year</p>
                  
                  <div className="flex items-center justify-between pt-2 mt-auto border-t" 
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="text-[10px] sm:text-xs text-white/70">8 semesters</span>
                    <span className="text-white text-sm transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BranchSchemes;
