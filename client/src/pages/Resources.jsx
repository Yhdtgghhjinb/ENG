import { useEffect, useState } from 'react';
import api from '../config/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';

const isPdf = (url) => typeof url === 'string' && url.toLowerCase().endsWith('.pdf');

const highlightText = (text, query) => {
  if (!query || !text) return text;
  const terms = query.split(/\s+/).map((t) => t.trim()).filter(Boolean);
  if (!terms.length) return text;
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return text.replace(pattern, '<mark class="bg-primary-600/40 text-primary-100 rounded px-0.5">$1</mark>');
};

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [searchParams] = useSearchParams();
  const [facets, setFacets] = useState({ schemes: [], branches: [], years: [], semesters: [], subjects: [], types: [] });
  const [filters, setFilters] = useState({ scheme: '', branch: '', year: '', semester: '', subject: '', type: '', q: '' });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchResources = async (params = {}) => {
    try { setLoading(true); setError('');
      const res = await api.get('/api/resources', { params });
      setResources(res.data || []);
      if (!selected && res.data?.length > 0) setSelected(res.data[0]);
    } catch { setError('Failed to load resources. Please try again.'); }
    finally { setLoading(false); }
  };

  const fetchFacets = async (params = {}) => {
    try { const res = await api.get('/api/resources/facets', { params }); setFacets((p) => ({ ...p, ...(res.data || {}) })); } catch {}
  };

  useEffect(() => {
    const initial = { ...filters, subject: searchParams.get('subject') || '', q: searchParams.get('q') || '' };
    setFilters(initial); fetchResources(initial); fetchFacets(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (nextFilters) => {
    const query = { ...nextFilters };
    if (!query.scheme) query.branch = query.year = query.semester = query.subject = '';
    if (!query.branch) query.year = query.semester = query.subject = '';
    if (!query.year) query.semester = query.subject = '';
    if (!query.semester) query.subject = '';
    setFilters(query); fetchResources(query); fetchFacets(query);
  };

  const handleFilterChange = (field, value) => applyFilters({ ...filters, [field]: value });

  const handleSearchChange = async (value) => {
    const next = { ...filters, q: value };
    setFilters(next);
    const trimmed = value.trim();
    if (!trimmed) { fetchResources({ ...next, q: '' }); return; }
    try {
      setLoading(true); setError('');
      const res = await api.get('/api/resources/search', { params: { query: trimmed, ...next } });
      const list = res.data?.resources || [];
      setResources(list);
      if (!selected && list.length > 0) setSelected(list[0]);
    } catch { setError('Search failed. Falling back to basic results.'); fetchResources(next); }
    finally { setLoading(false); }
  };

  const handleDownload = (res) => {
    if (!res?.fileUrl) return;
    const link = document.createElement('a');
    link.href = res.fileUrl; link.target = '_blank'; link.rel = 'noreferrer'; link.download = ''; link.click();
    toast.success('Download started');
  };

  const FilterChip = ({ value, active, disabled, onClick, children }) => (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`chip ${active ? 'chip-active' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      {children}
    </button>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/home' }, { label: 'Resources' }]} />

      <div className="space-y-2">
        <p className="section-label">Resource Explorer</p>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Find Your Resources</h2>
        <p className="text-xs sm:text-sm text-slate-400">Drill down by scheme → branch → year → semester → subject</p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[300px,minmax(0,1.3fr),minmax(0,1.2fr)]">
        {/* Filters Sidebar */}
        <aside className="space-y-5 sm:space-y-6 rounded-2xl sm:rounded-3xl border border-slate-800/50 bg-slate-950/70 p-4 sm:p-5 backdrop-blur">
          <div className="space-y-2">
            <p className="section-label">Quick Search</p>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input type="text" placeholder="Search by title, subject..." value={filters.q}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="input-premium w-full pl-9 text-xs" />
            </div>
          </div>

          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)' }} />

          {[
            { label: 'Scheme', field: 'scheme', items: facets.schemes, dep: null },
            { label: 'Branch', field: 'branch', items: facets.branches, dep: filters.scheme },
          ].map(({ label, field, items, dep }) => (
            <div key={field} className="space-y-2">
              <p className="section-label">{label}</p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <FilterChip key={item} active={filters[field] === item} disabled={dep !== null && !dep}
                    onClick={() => handleFilterChange(field, filters[field] === item ? '' : item)}>
                    {item}
                  </FilterChip>
                ))}
                {items.length === 0 && <p className="text-[11px] text-slate-600">No {label.toLowerCase()} yet</p>}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Year', field: 'year', items: facets.years, dep: filters.branch },
              { label: 'Semester', field: 'semester', items: facets.semesters, dep: filters.year },
            ].map(({ label, field, items, dep }) => (
              <div key={field} className="space-y-2">
                <p className="section-label">{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <FilterChip key={item} active={String(filters[field]) === String(item)} disabled={!dep}
                      onClick={() => handleFilterChange(field, String(filters[field]) === String(item) ? '' : item)}>
                      {item}
                    </FilterChip>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="section-label">Subject</p>
            <div className="flex flex-wrap gap-1.5">
              {facets.subjects.map((s) => (
                <FilterChip key={s} active={filters.subject === s} disabled={!filters.semester}
                  onClick={() => handleFilterChange('subject', filters.subject === s ? '' : s)}>
                  {s}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="section-label">Type</p>
            <div className="flex flex-wrap gap-1.5">
              {['notes', 'pyq', 'lab', 'assignment', 'reference', 'syllabus', 'other'].map((t) => (
                <FilterChip key={t} active={filters.type === t}
                  onClick={() => handleFilterChange('type', filters.type === t ? '' : t)}>
                  {t.toUpperCase()}
                </FilterChip>
              ))}
            </div>
          </div>
        </aside>

        {/* Resource List */}
        <section className="glass-card gradient-border space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-slate-800/50 p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{resources.length} matching resources</span>
            {loading && <span className="text-primary-400">Searching...</span>}
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">{error}</div>
          )}

          {!loading && !error && resources.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-center text-xs text-slate-500">
              No resources found for the current filters.
            </div>
          )}

          <div className="flex flex-col gap-3">
            {loading
              ? [0, 1, 2, 3].map((i) => (
                  <div key={i} className="skeleton rounded-2xl" style={{ height: 88 }} />
                ))
              : resources.map((r, i) => (
                <motion.div key={r._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04, ease: 'easeOut' }}
                  whileHover={{ y: -3, scale: 1.005 }}
                  className={`group rounded-2xl border p-4 text-xs shadow-lg transition cursor-pointer ${
                    selected?._id === r._id
                      ? 'border-primary-500/50 bg-primary-600/8 shadow-primary-900/20'
                      : 'border-slate-800/60 bg-slate-950/50 hover:border-primary-500/30 hover:bg-slate-900/70'
                  }`}
                  onClick={() => setSelected(r)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-semibold text-slate-50 group-hover:text-white truncate">{r.title}</p>
                      <p className="line-clamp-1 text-[11px] text-slate-400"
                        dangerouslySetInnerHTML={{ __html: highlightText(r.description, filters.q) }} />
                    </div>
                    <span className="badge flex-shrink-0">{r.type}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-500">
                    {[r.scheme, r.branch, `Year ${r.year}`, `Sem ${r.semester}`, r.subject].filter(Boolean).map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-900/80 px-2 py-0.5 border border-slate-800/60">{tag}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn-primary px-3 py-1.5 text-[11px]" onClick={(e) => e.stopPropagation()}>Preview</a>
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleDownload(r); }} className="btn-ghost px-3 py-1.5 text-[11px]">Download</button>
                  </div>
                </motion.div>
              ))}
          </div>
        </section>

        {/* Preview Panel */}
        <section className="hidden flex-col gap-5 rounded-3xl border border-slate-800/50 bg-slate-950/70 p-5 sm:flex">
          <div>
            <p className="section-label mb-3">Preview</p>
            {selected ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-50">{selected.title}</p>
                <p className="text-xs text-slate-400">{selected.description}</p>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {[selected.scheme, selected.branch, `Year ${selected.year}`, `Sem ${selected.semester}`, selected.subject, selected.type?.toUpperCase()].filter(Boolean).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-900/80 px-2 py-0.5 border border-slate-800/60 text-slate-400">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button type="button" onClick={() => handleDownload(selected)} className="btn-primary px-4 py-2 text-xs">Download</button>
                  <a href={selected.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-300 underline decoration-dotted underline-offset-2">Open ↗</a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">Select a resource to preview</p>
            )}
          </div>

          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)' }} />

          <div className="flex-1 overflow-hidden rounded-xl border border-slate-800/60 bg-slate-950/80">
            {selected && isPdf(selected.fileUrl) ? (
              <iframe title={selected.title} src={selected.fileUrl} className="h-full w-full" />
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center px-4 text-center text-xs text-slate-600">
                {selected ? 'PDF preview only. Use "Open ↗" for other formats.' : 'No resource selected yet.'}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Resources;
