import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const codeRegex = /\b\d{2}[A-Z]{2}\d{2}\b/i;

const slugify = (v) =>
  String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const inferCode = (resource, index) => {
  const src = `${resource.title || ''} ${resource.description || ''} ${(resource.tags || []).join(' ')}`;
  const m = src.match(codeRegex);
  return m ? m[0].toUpperCase() : `21CS${String(40 + index).padStart(2, '0')}`;
};

const subjectColors = [
  { from: 'rgba(99,102,241,0.4)', to: 'rgba(79,70,229,0.2)', icon: '💻' },
  { from: 'rgba(14,165,233,0.4)', to: 'rgba(2,132,199,0.2)', icon: '🌐' },
  { from: 'rgba(217,70,239,0.4)', to: 'rgba(168,85,247,0.2)', icon: '🧬' },
  { from: 'rgba(16,185,129,0.4)', to: 'rgba(5,150,105,0.2)', icon: '⚙️' },
  { from: 'rgba(244,63,94,0.4)', to: 'rgba(225,29,72,0.2)', icon: '📡' },
  { from: 'rgba(245,158,11,0.4)', to: 'rgba(217,119,6,0.2)', icon: '⚡' },
];

const Subjects = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/resources').then((r) => setResources(r.data || [])).finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(() => {
    const map = new Map();
    resources.forEach((r, idx) => {
      if (!r.subject) return;
      if (!map.has(r.subject)) {
        map.set(r.subject, {
          name: r.subject,
          code: inferCode(r, idx),
          semester: r.semester || '-',
          branch: r.branch || 'CSE',
          count: 0,
          slug: slugify(r.subject),
        });
      }
      map.get(r.subject).count += 1;
    });
    return [...map.values()];
  }, [resources]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }, [subjects, search]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">All Subjects</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{filtered.length} subjects available</p>
        </div>
        <div className="relative w-full sm:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subjects..." 
            className="w-full rounded-lg border bg-transparent px-3 py-2 pl-9 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:border-indigo-400"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton rounded-xl" style={{ height: 180 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((subject, index) => {
            const style = subjectColors[index % subjectColors.length];
            return (
              <Link
                key={subject.slug}
                to={`/home/resources?subject=${encodeURIComponent(subject.name)}`}
                className="group block rounded-xl p-4 sm:p-5 transition-all duration-200 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${style.from} 0%, ${style.to} 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  minHeight: '180px',
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
                      Sem {subject.semester}
                    </span>
                  </div>
                  
                  <p className="text-[11px] sm:text-xs font-mono font-bold text-white/80 mb-2">{subject.code}</p>
                  <h3 className="text-sm sm:text-base font-bold text-white mb-2 line-clamp-2 flex-1 leading-snug">
                    {subject.name}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-2 mt-auto border-t" 
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="text-[10px] sm:text-xs text-white/70">{subject.count} resources</span>
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

export default Subjects;
