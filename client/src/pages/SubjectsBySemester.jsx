import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Breadcrumbs from '../components/Breadcrumbs';

const subjectColors = [
  { from: 'rgba(99,102,241,0.4)', to: 'rgba(79,70,229,0.2)', icon: '💻' },
  { from: 'rgba(14,165,233,0.4)', to: 'rgba(2,132,199,0.2)', icon: '🌐' },
  { from: 'rgba(217,70,239,0.4)', to: 'rgba(168,85,247,0.2)', icon: '🧬' },
  { from: 'rgba(16,185,129,0.4)', to: 'rgba(5,150,105,0.2)', icon: '⚙️' },
  { from: 'rgba(244,63,94,0.4)', to: 'rgba(225,29,72,0.2)', icon: '📡' },
  { from: 'rgba(245,158,11,0.4)', to: 'rgba(217,119,6,0.2)', icon: '⚡' },
  { from: 'rgba(168,85,247,0.4)', to: 'rgba(147,51,234,0.2)', icon: '🔬' },
  { from: 'rgba(20,184,166,0.4)', to: 'rgba(13,148,136,0.2)', icon: '📐' },
];

const SubjectsBySemester = () => {
  const { branchId, schemeId, semesterNumber } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [schemeName, setSchemeName] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/vtu/branches/${branchId}/schemes/${schemeId}/semesters/${semesterNumber}/subjects`),
      axios.get(`/api/vtu/branches`),
      axios.get(`/api/vtu/branches/${branchId}/schemes`),
    ]).then(([subjectsRes, branchesRes, schemesRes]) => {
      setSubjects(subjectsRes.data || []);
      const b = (branchesRes.data || []).find(x => String(x._id) === String(branchId));
      const s = (schemesRes.data || []).find(x => String(x._id) === String(schemeId));
      setBranchName(b?.name || b?.code || '');
      setSchemeName(s?.label || (s?.year ? String(s.year) : '') || '');
    }).finally(() => setLoading(false));
  }, [branchId, schemeId, semesterNumber]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(
      (s) => String(s.name || '').toLowerCase().includes(q) || String(s.code || '').toLowerCase().includes(q)
    );
  }, [subjects, search]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Home', to: '/home' },
        { label: branchName || '…', to: `/home/branches/${branchId}` },
        { label: schemeName || '…', to: `/home/branches/${branchId}/schemes/${schemeId}` },
        { label: `Semester ${semesterNumber}` },
      ]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Semester {semesterNumber} Subjects</h2>
          <p className="text-sm text-slate-400 mt-1">{filtered.length} subjects · Click to view resources</p>
        </div>
        <div className="relative w-full sm:w-80">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subject or code..." 
            className="w-full rounded-lg border bg-transparent px-4 py-2 pl-10 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:border-indigo-400"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton rounded-2xl" style={{ height: 200 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((subject, idx) => {
            const style = subjectColors[idx % subjectColors.length];
            return (
              <Link
                key={subject._id}
                to={`/home/subjects/${subject._id}`}
                className="group block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: `linear-gradient(135deg, ${style.from} 0%, ${style.to} 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  minHeight: '200px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                      style={{ 
                        background: 'rgba(255,255,255,0.15)', 
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)' 
                      }}>
                      {style.icon}
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-lg"
                      style={{ 
                        background: 'rgba(255,255,255,0.2)', 
                        color: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)' 
                      }}>
                      {subject.code}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-white mb-3 line-clamp-2 flex-1 leading-snug">
                    {subject.name}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-3 mt-auto border-t" 
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="text-xs text-white/70">Notes • PYQs • Labs</span>
                    <span className="text-white transition-transform group-hover:translate-x-1">→</span>
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

export default SubjectsBySemester;
