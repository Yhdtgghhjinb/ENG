import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../config/api';
import Breadcrumbs from '../components/Breadcrumbs';

const semesterColors = [
  { from: 'rgba(99,102,241,0.4)', to: 'rgba(79,70,229,0.2)' },
  { from: 'rgba(14,165,233,0.4)', to: 'rgba(2,132,199,0.2)' },
  { from: 'rgba(16,185,129,0.4)', to: 'rgba(5,150,105,0.2)' },
  { from: 'rgba(217,70,239,0.4)', to: 'rgba(168,85,247,0.2)' },
  { from: 'rgba(244,63,94,0.4)', to: 'rgba(225,29,72,0.2)' },
  { from: 'rgba(245,158,11,0.4)', to: 'rgba(217,119,6,0.2)' },
  { from: 'rgba(168,85,247,0.4)', to: 'rgba(147,51,234,0.2)' },
  { from: 'rgba(20,184,166,0.4)', to: 'rgba(13,148,136,0.2)' },
];

const Semesters = () => {
  const { branchId, schemeId } = useParams();
  const [semesters, setSemesters] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [schemeName, setSchemeName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/api/vtu/branches/${branchId}/schemes/${schemeId}/semesters`),
      api.get(`/api/vtu/branches`),
      api.get(`/api/vtu/branches/${branchId}/schemes`),
    ]).then(([semRes, branchRes, schemeRes]) => {
      setSemesters(semRes.data || []);
      const b = (branchRes.data || []).find(x => String(x._id) === String(branchId));
      const s = (schemeRes.data || []).find(x => String(x._id) === String(schemeId));
      setBranchName(b?.name || b?.code || '');
      setSchemeName(s?.label || (s?.year ? String(s.year) : '') || '');
    }).finally(() => setLoading(false));
  }, [branchId, schemeId]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <Breadcrumbs items={[{ label: 'Home', to: '/home' }, { label: branchName || '…', to: `/home/branches/${branchId}` }, { label: schemeName || '…' }]} />

      <div className="rounded-xl p-4 sm:p-5" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">{branchName} · {schemeName}</h2>
        <p className="text-xs sm:text-sm text-slate-400">Select your semester</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="skeleton rounded-xl" style={{ height: 140 }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {semesters.map((sem, idx) => {
            const style = semesterColors[idx % semesterColors.length];
            return (
              <Link
                key={sem._id}
                to={`/home/branches/${branchId}/schemes/${schemeId}/semesters/${sem.number}`}
                className="group block rounded-xl p-4 sm:p-5 transition-all duration-200 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${style.from} 0%, ${style.to} 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  minHeight: '140px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                }}
              >
                <div className="flex flex-col h-full justify-center">
                  <p className="text-5xl sm:text-6xl font-bold text-white mb-1">{sem.number}</p>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/70 mb-2">Semester</p>
                  
                  <div className="flex items-center justify-between pt-2 mt-auto border-t" 
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="text-[10px] sm:text-xs text-white/70">Subjects</span>
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

export default Semesters;
