import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const SubjectView = () => {
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/resources/subjects').then((r) => {
      const list = r.data || [];
      setSubjects(list);
      if (list.length > 0) setActiveSubject(list[0]);
    }).catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    if (!activeSubject) return;
    setLoading(true);
    axios.get(`/api/resources/subject/${encodeURIComponent(activeSubject)}`)
      .then((r) => setResources(r.data || []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [activeSubject]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="section-label">Subject View</p>
        <h2 className="text-3xl font-bold text-white">Subject Resources</h2>
        <p className="text-sm text-slate-400">Pick a subject to see a structured view of its resources</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px,1fr]">
        {/* Subject List */}
        <aside className="rounded-2xl border border-slate-800/60 bg-slate-950/70 p-4">
          <p className="section-label mb-3">Subjects</p>
          <div className="flex flex-col gap-1.5">
            {subjects.length === 0 && (
              <p className="text-xs text-slate-600">No subjects yet. Add resources via the backend.</p>
            )}
            {subjects.map((s) => (
              <button key={s} type="button" onClick={() => setActiveSubject(s)}
                className={`rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                  activeSubject === s
                    ? 'nav-active'
                    : 'nav-item text-slate-400'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </aside>

        {/* Resource Panel */}
        <section className="glass-card gradient-border rounded-2xl border border-slate-800/50 p-5">
          <div className="mb-5 flex items-center justify-between gap-2">
            <div>
              <p className="text-base font-semibold text-slate-100">{activeSubject || 'No subject selected'}</p>
              <p className="text-xs text-slate-500">High-yield materials grouped for this course</p>
            </div>
            {resources.length > 0 && (
              <span className="badge">{resources.length} resources</span>
            )}
          </div>

          {loading && <p className="text-xs text-slate-500">Loading resources…</p>}
          {!loading && resources.length === 0 && (
            <p className="text-xs text-slate-600">No resources for this subject yet.</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {resources.map((r) => (
              <motion.a key={r._id} href={r.url} target="_blank" rel="noreferrer"
                whileHover={{ y: -4 }}
                className="block rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4 text-xs transition hover:border-primary-500/40">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-50">{r.title}</p>
                  <span className="badge flex-shrink-0">{r.type}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-slate-400">{r.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {r.difficulty && (
                      <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-800/60">{r.difficulty}</span>
                    )}
                    {(r.tags || []).slice(0, 3).map((t) => (
                      <span key={t} className="rounded-full bg-slate-950/80 px-2 py-0.5 text-[10px] text-slate-500 border border-slate-800/60">{t}</span>
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-primary-300">Open ↗</span>
                </div>
              </motion.a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SubjectView;
