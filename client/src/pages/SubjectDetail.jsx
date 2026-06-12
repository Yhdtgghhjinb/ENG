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
        <div className="relative rounded-xl p-4 transition-all duration-200 cursor-pointer"
          style={{
            background: hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${hovered ? `rgba(${rgb},0.3)` : 'rgba(255,255,255,0.06)'}`,
          }}>
          
          {/* Resource Icon & Title */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg"
              style={{ background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.2)` }}>
              📄
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-200 line-clamp-2 leading-snug mb-1">
                {resource.title}
              </h4>
              {resource.unitTitle && (
                <p className="text-xs text-slate-500 line-clamp-1">{resource.unitTitle}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isPdf && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: `rgba(${rgb},0.15)`,
                  color: color,
                  border: `1px solid rgba(${rgb},0.3)`,
                }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                Preview
              </button>
            )}
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </button>
          </div>

          {/* Download Count Badge */}
          {resource.downloadCount > 0 && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#94a3b8' }}>
              {resource.downloadCount} downloads
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
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white">{resource.title}</h3>
                <button
                  onClick={() => setExpanded(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors">
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
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
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
        <svg className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
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
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {/* ═══════════════ COMPACT HEADER ═══════════════ */}
      <div className="mt-6 mb-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          {/* Subject Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                📚
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{subject?.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  {subject?.code && (
                    <span className="text-sm font-mono text-indigo-400">{subject.code}</span>
                  )}
                  {subject?.semesterNumber && (
                    <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-400">
                      Semester {subject.semesterNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Compact Stats */}
          <div className="flex gap-3 flex-wrap">
            <div className="px-4 py-2 rounded-lg text-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="text-lg font-bold text-white">{sectionCounts.notes}</div>
              <div className="text-xs text-slate-400">Notes</div>
            </div>
            <div className="px-4 py-2 rounded-lg text-center" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <div className="text-lg font-bold text-white">{sectionCounts.pyq}</div>
              <div className="text-xs text-slate-400">PYQs</div>
            </div>
            <div className="px-4 py-2 rounded-lg text-center" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div className="text-lg font-bold text-white">{sectionCounts.textbook}</div>
              <div className="text-xs text-slate-400">Books</div>
            </div>
            <div className="px-4 py-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-lg font-bold text-white">{totalFiles}</div>
              <div className="text-xs text-slate-400">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ SEARCH BAR ═══════════════ */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search resources..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* ═══════════════ TAB NAVIGATION ═══════════════ */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          {SECTIONS.filter(s => sectionCounts[s.key] > 0).map(section => (
            <button
              key={section.key}
              onClick={() => handleTabChange(section.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              style={{
                background: activeTab === section.key ? `rgba(${section.rgb},0.15)` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeTab === section.key ? `rgba(${section.rgb},0.3)` : 'rgba(255,255,255,0.06)'}`,
                color: activeTab === section.key ? section.color : '#94a3b8',
              }}>
              <span>{section.icon}</span>
              <span>{section.label}</span>
              <span className="px-2 py-0.5 rounded-md text-xs font-bold"
                style={{ background: activeTab === section.key ? `rgba(${section.rgb},0.2)` : 'rgba(255,255,255,0.05)' }}>
                {sectionCounts[section.key]}
              </span>
            </button>
          ))}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {noteGeneral.map(r => (
                      <ResourceCard key={r._id} resource={r} color={activeSection.color} rgb={activeSection.rgb} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
