import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Breadcrumbs from '../components/Breadcrumbs';

const CATEGORY_META = {
  notes:           { label: 'Notes',          icon: '\u{1F4C4}', accent: '#818cf8', glow: 'rgba(99,102,241,0.55)',  grad: 'linear-gradient(135deg, rgba(99,102,241,0.28) 0%, rgba(139,92,246,0.16) 55%, rgba(5,8,22,0.96) 100%)' },
  pyq:             { label: 'Previous Papers', icon: '\u{1F4C3}', accent: '#38bdf8', glow: 'rgba(14,165,233,0.55)',  grad: 'linear-gradient(135deg, rgba(14,165,233,0.28) 0%, rgba(34,211,238,0.16) 55%, rgba(5,8,22,0.96) 100%)' },
  model:           { label: 'Model Papers',    icon: '\u{1F4DD}', accent: '#34d399', glow: 'rgba(16,185,129,0.55)',  grad: 'linear-gradient(135deg, rgba(16,185,129,0.26) 0%, rgba(20,184,166,0.16) 55%, rgba(5,8,22,0.96) 100%)' },
  important:       { label: 'Important Qs',    icon: '\u2B50',    accent: '#fb7185', glow: 'rgba(244,63,94,0.55)',   grad: 'linear-gradient(135deg, rgba(244,63,94,0.26)  0%, rgba(217,70,239,0.14) 55%, rgba(5,8,22,0.96) 100%)' },
  lab:             { label: 'Lab Programs',    icon: '\u{1F9EA}', accent: '#fbbf24', glow: 'rgba(245,158,11,0.55)',  grad: 'linear-gradient(135deg, rgba(245,158,11,0.26) 0%, rgba(234,88,12,0.14)  55%, rgba(5,8,22,0.96) 100%)' },
  supplementary:   { label: 'Supplementary',  icon: '\u{1F4CE}', accent: '#a78bfa', glow: 'rgba(139,92,246,0.55)',  grad: 'linear-gradient(135deg, rgba(139,92,246,0.26) 0%, rgba(99,102,241,0.14) 55%, rgba(5,8,22,0.96) 100%)' },
  textbook:        { label: 'Textbooks',       icon: '\u{1F4DA}', accent: '#2dd4bf', glow: 'rgba(20,184,166,0.55)',  grad: 'linear-gradient(135deg, rgba(20,184,166,0.26) 0%, rgba(16,185,129,0.14) 55%, rgba(5,8,22,0.96) 100%)' },
  'question-bank': { label: 'Question Bank',  icon: '\u2B50',    accent: '#e879f9', glow: 'rgba(217,70,239,0.55)',  grad: 'linear-gradient(135deg, rgba(217,70,239,0.26) 0%, rgba(139,92,246,0.16) 55%, rgba(5,8,22,0.96) 100%)' },
};

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.36, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const SubjectResources = () => {
  const { subjectId, category } = useParams();
  const [subject, setSubject]   = useState(null);
  const [resources, setResources] = useState([]);
  const [q, setQ]               = useState('');
  const [loading, setLoading]   = useState(true);
  const meta = CATEGORY_META[category] || CATEGORY_META.notes;

  useEffect(() => {
    Promise.all([
      axios.get(`/api/vtu/subjects/${subjectId}`),
      axios.get(`/api/vtu/subjects/${subjectId}/resources`, { params: { type: category } }),
    ]).then(([sr, rr]) => {
      setSubject(sr.data || null);
      setResources(rr.data || []);
    }).finally(() => setLoading(false));
  }, [subjectId, category]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return resources;
    return resources.filter(r =>
      String(r.title || '').toLowerCase().includes(query) ||
      String(r.description || '').toLowerCase().includes(query)
    );
  }, [resources, q]);

  return (
    <div className="space-y-9">
      <Breadcrumbs items={[
        { label: 'Home', to: '/home' },
        { label: 'Subjects', to: '/home/subjects' },
        { label: subject?.name || 'Subject', to: `/subjects/${subjectId}` },
        { label: meta.label },
      ]} />

      {/* Category hero banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: meta.grad, border: `1px solid ${meta.accent}22` }}>
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full"
          style={{ background: `radial-gradient(circle, ${meta.glow}, transparent 70%)`, filter: 'blur(36px)', opacity: 0.5 }} />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="icon-box flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-3xl"
              style={{ background: `${meta.accent}20`, border: `1px solid ${meta.accent}35`, boxShadow: `0 0 28px ${meta.glow}35` }}>
              {meta.icon}
            </div>
            <div>
              <p className="section-label mb-1.5">{subject?.code || ''}</p>
              <h2 className="display-md text-white">{meta.label}</h2>
              <p className="mt-1.5 text-sm font-medium" style={{ color: `${meta.accent}cc` }}>{subject?.name}</p>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search resources…"
              className="input-premium w-full pl-10" />
          </div>
        </div>
      </motion.div>

      {/* Resource cards */}
      {loading ? (
        <div className="grid-cards-3">
          {[0,1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 220 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="text-5xl">{meta.icon}</span>
          <p className="mt-4 text-base font-semibold text-slate-300">
            {q ? 'No results found' : `No ${meta.label} uploaded yet`}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {q ? 'Try a different search term' : 'Check back later or explore other categories'}
          </p>
        </div>
      ) : (
        <>
          <p className="caption">{filtered.length} file{filtered.length !== 1 ? 's' : ''}</p>
          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055 } } }}
            initial="hidden" animate="show"
            className="grid-cards-3"
          >
            {filtered.map(r => (
              <motion.div key={r._id} variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="group relative overflow-hidden rounded-3xl"
                style={{ background: 'linear-gradient(145deg, rgba(11,17,38,0.94), rgba(7,11,26,0.9))', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 6px 24px rgba(0,0,0,0.45)', transition: 'box-shadow 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 18px 48px rgba(0,0,0,0.6), 0 0 0 1px ${meta.accent}45`; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.45)'; }}
              >
                <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${meta.accent}, transparent 70%)` }} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="icon-box flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                      style={{ background: `${meta.accent}18`, border: `1px solid ${meta.accent}30` }}>
                      {meta.icon}
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                      style={{ background: `${meta.accent}18`, color: meta.accent, border: `1px solid ${meta.accent}35` }}>
                      {r.type}
                    </span>
                  </div>
                  <h3 className="mt-4 line-clamp-2 text-base font-bold leading-snug text-white">{r.title}</h3>
                  {r.description && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{r.description}</p>}
                  {r.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {r.tags.slice(0, 3).map(t => (
                        <span key={t} className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-500 border border-slate-800/60">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex items-center gap-2.5 border-t pt-4" style={{ borderColor: `${meta.accent}18` }}>
                    <a href={r.fileUrl} target="_blank" rel="noreferrer"
                      className="btn-primary flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs"
                      style={{ background: `linear-gradient(135deg, ${meta.accent}ee, ${meta.accent}aa)`, border: `1px solid ${meta.accent}50` }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                      Preview
                    </a>
                    <a href={r.fileUrl} download className="btn-ghost flex items-center gap-1.5 py-2.5 text-xs">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Save
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default SubjectResources;
