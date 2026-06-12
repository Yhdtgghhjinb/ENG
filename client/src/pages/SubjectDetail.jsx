import { useEffect, useState, useCallback, memo, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';
import Breadcrumbs from '../components/Breadcrumbs';

/* ═══════════════════════════════════════════════════════════════════════════
   PREMIUM DASHBOARD REDESIGN - TAB-BASED LAYOUT
   Modern, clean, student-focused interface inspired by Coursera/Notion
   ═══════════════════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { key: 'notes',      label: 'Notes',               icon: '📚', color: '#6366f1', rgb: '99,102,241' },
  { key: 'pyq',        label: 'Question Papers',     icon: '📝', color: '#06b6d4', rgb: '6,182,212' },
  { key: 'model',      label: 'Model Papers',        icon: '📋', color: '#10b981', rgb: '16,185,129' },
  { key: 'textbook',   label: 'Textbooks',           icon: '📖', color: '#8b5cf6', rgb: '139,92,246' },
  { key: 'lab',        label: 'Labs',                icon: '🧪', color: '#f59e0b', rgb: '245,158,11' },
  { key: 'important',  label: 'Important',           icon: '⭐', color: '#ec4899', rgb: '236,72,153' },
  { key: 'assignment', label: 'Assignments',         icon: '✍️', color: '#ef4444', rgb: '239,68,68' },
  { key: 'reference',  label: 'Reference',           icon: '🔗', color: '#14b8a6', rgb: '20,184,166' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const searchResources = (resources, query) => {
  if (!query || !query.trim()) return resources;
  const lowerQuery = query.toLowerCase().trim();
  return resources.filter(r => 
    r.title?.toLowerCase().includes(lowerQuery) ||
    r.description?.toLowerCase().includes(lowerQuery) ||
    r.unitTitle?.toLowerCase().includes(lowerQuery)
  );
};

const getDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPACT RESOURCE CARD - Modern grid-based design
   ═══════════════════════════════════════════════════════════════════════════ */
const ResourceCard = memo(({ resource, color, rgb }) => {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const isPdf = resource.fileUrl?.toLowerCase().includes('.pdf') || 
    ['notes', 'pyq', 'model', 'textbook', 'lab', 'important', 'assignment', 'reference'].includes(resource.type);

  const handleDownload = async () => {
    if (resource._id) fetch(`/api/resources/${resource._id}/download`, { method: 'POST' }).catch(() => {});
    
    try {
      const response = await fetch(resource.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resource.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf' || 'download.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(resource.fileUrl, '_blank');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative rounded-xl p-4 transition-all duration-200 cursor-pointer touch-manipulation"
          style={{
            background: hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${hovered ? `rgba(${rgb},0.3)` : 'rgba(255,255,255,0.06)'}`,
          }}>
          
          {/* Resource Icon & Title */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-lg md:text-xl"
              style={{ background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.2)` }}>
              📄
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm md:text-base font-semibold text-slate-200 line-clamp-2 leading-snug mb-1">
                {resource.title}
              </h4>
              {resource.unitTitle && (
                <p className="text-xs text-slate-500 line-clamp-1">{resource.unitTitle}</p>
              )}
            </div>
          </div>

          {/* Action Buttons - Larger touch targets on mobile */}
          <div className="flex items-center gap-2">
            {isPdf && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all touch-manipulation min-h-[44px] md:min-h-0"
                style={{
                  background: `rgba(${rgb},0.15)`,
                  color: color,
                  border: `1px solid rgba(${rgb},0.3)`,
                }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <span className="hidden sm:inline">Preview</span>
              </button>
            )}
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 md:py-2 rounded-lg text-xs md:text-sm font-medium text-slate-400 hover:text-white transition-all touch-manipulation min-h-[44px] md:min-h-0"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>

          {/* Download Count Badge */}
          {resource.downloadCount > 0 && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#94a3b8' }}>
              {resource.downloadCount}
            </div>
          )}
        </div>
      </motion.div>

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {expanded && isPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl h-[90vh] rounded-2xl overflow-hidden"
              style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/10">
                <h3 className="text-sm md:text-base font-semibold text-white truncate pr-4">{resource.title}</h3>
                <button
                  onClick={() => setExpanded(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              {/* PDF Viewer */}
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(resource.fileUrl)}&embedded=true`}
                className="w-full h-full"
                style={{ height: 'calc(100% - 65px)' }}
                title={resource.title}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE CARD - For Notes section
   ═══════════════════════════════════════════════════════════════════════════ */
const ModuleCard = memo(({ moduleNumber, unitTitle, resources }) => {
  const [expanded, setExpanded] = useState(false);
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
  const color = colors[(moduleNumber - 1) % colors.length];
  const rgb = ['99,102,241', '6,182,212', '16,185,129', '245,158,11', '236,72,153'][(moduleNumber - 1) % 5];

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: `rgba(${rgb},0.15)`, color, border: `1px solid rgba(${rgb},0.3)` }}>
            {moduleNumber}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Module {moduleNumber}</p>
            <p className="text-xs text-slate-500">{unitTitle || `${resources.length} files`}</p>
          </div>
        </div>
        <svg className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5"
          >
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {resources.map(r => (
                <ResourceCard key={r._id} resource={r} color={color} rgb={rgb} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const SubjectDetail = () => {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [counts, setCounts] = useState({});
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);
  const sectionCacheRef = useRef({});
  const resourceLimit = useMemo(() => getDeviceType() === 'mobile' ? 20 : 50, []);

  // Initial load
  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const [sr, cr] = await Promise.all([
        api.get(`/api/vtu/subjects/${subjectId}`),
        api.get(`/api/subjects/${subjectId}/counts`),
      ]);
      setSubject(sr.data || null);
      setCounts(cr.data?.counts || {});
    } catch (err) {
      console.error('Failed to load subject:', err);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  // Load section
  const loadSection = useCallback(async (sectionKey) => {
    if (sectionCacheRef.current[sectionKey]) {
      setSections(prev => ({ ...prev, [sectionKey]: sectionCacheRef.current[sectionKey] }));
      return;
    }
    
    try {
      const response = await api.get(`/api/subjects/${subjectId}/resources`, {
        params: { section: sectionKey, limit: resourceLimit }
      });
      
      const data = response.data;
      const sectionData = {
        resources: data[sectionKey] || [],
        notes: data.notes || null,
      };
      
      sectionCacheRef.current[sectionKey] = sectionData;
      setSections(prev => ({ ...prev, [sectionKey]: sectionData }));
    } catch (err) {
      console.error(`Failed to load section ${sectionKey}:`, err);
    }
  }, [subjectId, resourceLimit]);

  // Handle tab change
  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
    if (!sections[tabKey] && !sectionCacheRef.current[tabKey]) {
      loadSection(tabKey);
    }
  }, [sections, loadSection]);

  // Search handler
  const handleSearch = useCallback((query) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setSearchQuery(query), 300);
  }, []);

  useEffect(() => { loadInitial(); }, [loadInitial]);
  useEffect(() => { if (activeTab && !sections[activeTab]) loadSection(activeTab); }, [activeTab, sections, loadSection]);

  const sectionCounts = SECTIONS.reduce((acc, s) => ({ ...acc, [s.key]: counts[s.key] || 0 }), {});
  const totalFiles = Object.values(sectionCounts).reduce((a, b) => a + b, 0);
  const activeSection = SECTIONS.find(s => s.key === activeTab);
  
  const noteModules = sections.notes?.notes?.modules || [];
  const noteGeneral = sections.notes?.notes?.general || [];
  const flatResources = sections[activeTab]?.resources || [];
  
  const filteredFlat = searchQuery ? searchResources(flatResources, searchQuery) : flatResources;
  const filteredModules = searchQuery ? noteModules.map(m => ({
    ...m, resources: searchResources(m.resources, searchQuery)
  })).filter(m => m.resources.length > 0) : noteModules;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="pb-16">
      <Breadcrumbs items={[{ label: 'Home', to: '/home' }, { label: subject?.name || 'Subject' }]} />

      {/* ═══════════════ ENHANCED HEADER WITH ACADEMIC INFO ═══════════════ */}
      <div className="mt-4 mb-4">
        {/* Subject Title & Icon */}
        <div className="flex items-start gap-3 mb-2">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
            📚
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1.5">{subject?.name}</h1>
            
            {/* Academic Info Chips - Both Desktop & Mobile */}
            <div className="flex flex-wrap items-center gap-1.5">
              {subject?.code && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {subject.code}
                </span>
              )}
              {subject?.semesterNumber && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Semester {subject.semesterNumber}
                </span>
              )}
              {subject?.scheme && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  {subject.scheme}
                </span>
              )}
              {subject?.credits && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {subject.credits} Credits
                </span>
              )}
              {(subject?.lectureHours || subject?.tutorialHours || subject?.practicalHours) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  L-T-P: {subject.lectureHours || 0}-{subject.tutorialHours || 0}-{subject.practicalHours || 0}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Resource Stats - Unified for Both Desktop & Mobile */}
        <div className="flex gap-2 justify-end flex-wrap">
          <div className="px-3 py-1.5 rounded-lg text-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="text-base font-bold text-white">{sectionCounts.notes}</div>
            <div className="text-xs text-slate-400">Notes</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg text-center" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <div className="text-base font-bold text-white">{sectionCounts.pyq}</div>
            <div className="text-xs text-slate-400">PYQs</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg text-center" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="text-base font-bold text-white">{sectionCounts.textbook}</div>
            <div className="text-xs text-slate-400">Books</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-base font-bold text-white">{totalFiles}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
        </div>
      </div>

      {/* ═══════════════ COURSE DETAILS ACCORDION ═══════════════ */}
      {(subject?.courseObjectives?.length > 0 || 
        subject?.courseOutcomes?.length > 0 || 
        subject?.referenceBooks?.length > 0 ||
        subject?.courseHandoutUrl ||
        subject?.syllabus) && (
        <div className="mb-5">
          <details className="group rounded-xl overflow-hidden transition-all"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <summary className="flex items-center justify-between px-4 md:px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">📋</span>
                <div>
                  <p className="text-sm font-semibold text-white">Course Details</p>
                  <p className="text-xs text-slate-500">Objectives, Outcomes & Resources</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180 flex-shrink-0"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7"/>
              </svg>
            </summary>
            
            <div className="px-4 md:px-6 py-4 space-y-6 border-t border-white/5">
              {/* Course Handout Link */}
              {subject.courseHandoutUrl && (
                <div>
                  <a href={subject.courseHandoutUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors touch-manipulation">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Download Course Handout
                  </a>
                </div>
              )}

              {/* Course Objectives */}
              {subject.courseObjectives?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-indigo-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                    Course Objectives
                  </h3>
                  <ul className="space-y-2">
                    {subject.courseObjectives.map((obj, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                          {i + 1}
                        </span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Course Outcomes */}
              {subject.courseOutcomes?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-emerald-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Course Outcomes
                  </h3>
                  <ul className="space-y-2">
                    {subject.courseOutcomes.map((out, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-300">
                        <span className="flex-shrink-0 w-7 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                          CO{i + 1}
                        </span>
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Reference Books */}
              {subject.referenceBooks?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-purple-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                    Reference Books
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {subject.referenceBooks.map((book, i) => (
                      <span key={i} className="px-3 py-2 rounded-lg text-xs text-slate-300"
                        style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                        📚 {book}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Syllabus */}
              {subject.syllabus && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-cyan-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Syllabus
                  </h3>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{subject.syllabus}</p>
                  </div>
                </div>
              )}
            </div>
          </details>
        </div>
      )}

      {/* ═══════════════ STICKY SEARCH BAR ═══════════════ */}
      <div className="sticky top-0 z-20 bg-[#020617] py-2 -mx-4 px-4 md:mx-0 md:px-0 md:static md:mb-4 mb-3 border-b md:border-b-0 border-white/5">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search resources..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
          />
        </div>
      </div>

      {/* ═══════════════ TAB NAVIGATION ═══════════════ */}
      <div className="mb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {SECTIONS.filter(s => sectionCounts[s.key] > 0).map(section => (
              <button
                key={section.key}
                onClick={() => handleTabChange(section.key)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                style={{
                  background: activeTab === section.key ? `rgba(${section.rgb},0.15)` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeTab === section.key ? `rgba(${section.rgb},0.3)` : 'rgba(255,255,255,0.06)'}`,
                  color: activeTab === section.key ? section.color : '#94a3b8',
                }}>
                <span className="text-base">{section.icon}</span>
                <span>{section.label}</span>
                <span className="px-1.5 py-0.5 rounded-md text-xs font-bold"
                  style={{ background: activeTab === section.key ? `rgba(${section.rgb},0.2)` : 'rgba(255,255,255,0.05)' }}>
                  {sectionCounts[section.key]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════ CONTENT AREA ═══════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'notes' ? (
            <div className="space-y-3">
              {filteredModules.map((m, i) => (
                <ModuleCard key={m.moduleNumber} {...m} />
              ))}
              {noteGeneral.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 px-1">General Notes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {noteGeneral.map(r => (
                      <ResourceCard key={r._id} resource={r} color={activeSection.color} rgb={activeSection.rgb} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredFlat.map(r => (
                <ResourceCard key={r._id} resource={r} color={activeSection.color} rgb={activeSection.rgb} />
              ))}
              {filteredFlat.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="text-6xl mb-4 opacity-20">{activeSection.icon}</div>
                  <p className="text-slate-400">No {activeSection.label.toLowerCase()} available</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SubjectDetail;
