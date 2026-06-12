import { useEffect, useState, useCallback, memo, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';

/* ═══════════════════════════════════════════════════════════════════════════
   SUBJECT DETAIL PAGE - COMPLETE REBUILD
   Premium educational platform UI - Mobile First, Desktop Optimized
   ═══════════════════════════════════════════════════════════════════════════ */

const RESOURCE_TYPES = [
  { key: 'notes', label: 'Notes', icon: '📚', color: '#6366f1' },
  { key: 'pyq', label: 'PYQs', icon: '📝', color: '#06b6d4' },
  { key: 'model', label: 'Models', icon: '📋', color: '#10b981' },
  { key: 'textbook', label: 'Books', icon: '📖', color: '#8b5cf6' },
  { key: 'lab', label: 'Labs', icon: '🧪', color: '#f59e0b' },
  { key: 'important', label: 'Important', icon: '⭐', color: '#ec4899' },
  { key: 'assignment', label: 'Assignments', icon: '✍️', color: '#ef4444' },
  { key: 'reference', label: 'Reference', icon: '🔗', color: '#14b8a6' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const searchResources = (resources, query) => {
  if (!Array.isArray(resources)) return [];
  if (!query?.trim()) return resources;
  const q = query.toLowerCase().trim();
  return resources.filter(r => 
    r?.title?.toLowerCase().includes(q) ||
    r?.description?.toLowerCase().includes(q) ||
    r?.unitTitle?.toLowerCase().includes(q)
  );
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ═══════════════════════════════════════════════════════════════════════════
   RESOURCE CARD COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const ResourceCard = memo(({ resource, color }) => {
  const [previewing, setPreviewing] = useState(false);

  const isPdf = resource.fileUrl?.toLowerCase().includes('.pdf') || 
    ['notes', 'pyq', 'model', 'textbook', 'lab', 'important', 'assignment', 'reference'].includes(resource.type);

  const handleDownload = async () => {
    if (resource._id) {
      fetch(`/api/resources/${resource._id}/download`, { method: 'POST' }).catch((err) => {
        console.error('Failed to track download:', err);
        // Download tracking is analytics only - non-critical
      });
    }
    
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
    } catch {
      window.open(resource.fileUrl, '_blank');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/10"
      >
        <div className="flex items-start gap-3.5">
          {/* PDF Icon */}
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            📄
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-100 line-clamp-2 mb-1.5 leading-snug group-hover:text-white transition-colors">
              {resource.title}
            </h4>
            
            {/* Meta Info */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {resource.fileSize && <span>{formatFileSize(resource.fileSize)}</span>}
              {resource.uploadedAt && (
                <>
                  {resource.fileSize && <span>•</span>}
                  <span>{formatDate(resource.uploadedAt)}</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-2.5">
              {isPdf && (
                <button
                  onClick={() => setPreviewing(true)}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
                  style={{ background: `${color}20`, color: color, border: `1px solid ${color}40` }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  Preview
                </button>
              )}
              <button
                onClick={handleDownload}
                className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Save
              </button>
            </div>
          </div>

          {/* Download Badge */}
          {resource.downloadCount > 0 && (
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/50 text-xs text-slate-400">
              {resource.downloadCount}
            </div>
          )}
        </div>
      </motion.div>

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {previewing && isPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewing(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-5xl h-[90vh] bg-slate-900 rounded-xl overflow-hidden border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white truncate pr-4">{resource.title}</h3>
                <button
                  onClick={() => setPreviewing(false)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(resource.fileUrl)}&embedded=true`}
                className="w-full"
                style={{ height: 'calc(100% - 57px)' }}
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
   MODULE CARD COMPONENT (For Notes)
   ═══════════════════════════════════════════════════════════════════════════ */
const ModuleCard = memo(({ moduleNumber, unitTitle, resources, color }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-white/[0.03] transition-all duration-200 active:scale-[0.99] min-h-[60px]"
      >
        <div 
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold border transition-transform duration-200 group-hover:scale-105"
          style={{ background: `${color}15`, color: color, borderColor: `${color}30` }}
        >
          {moduleNumber}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-semibold text-white">Module {moduleNumber}</div>
          <div className="text-xs text-slate-400 mt-0.5">{resources.length} {resources.length === 1 ? 'File' : 'Files'}</div>
        </div>
        <svg 
          className={`w-5 h-5 text-slate-400 transition-all duration-300 flex-shrink-0 ${expanded ? 'rotate-180 text-slate-300' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-t border-white/5"
          >
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(r => (
                <ResourceCard key={r._id} resource={r} color={color} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN SUBJECT DETAIL COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [subject, setSubject] = useState(null);
  const [counts, setCounts] = useState({});
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseInfoOpen, setCourseInfoOpen] = useState(false);
  
  // Refs
  const searchTimeoutRef = useRef(null);
  const sectionCacheRef = useRef({});
  const resourceLimit = 50;

  /* ═══════════════════════════════════════════════════════════════════════════
     DATA FETCHING
     ═══════════════════════════════════════════════════════════════════════════ */

  // Load subject info and counts
  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const [subjectRes, countsRes] = await Promise.all([
        api.get(`/api/vtu/subjects/${subjectId}`),
        api.get(`/api/subjects/${subjectId}/counts`),
      ]);
      setSubject(subjectRes.data || null);
      setCounts(countsRes.data?.counts || {});
    } catch (err) {
      console.error('Failed to load subject:', err);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  // Load section resources (lazy)
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

  // Tab change handler
  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
    if (!sections[tabKey] && !sectionCacheRef.current[tabKey]) {
      loadSection(tabKey);
    }
  }, [sections, loadSection]);

  // Search handler with debounce
  const handleSearch = useCallback((query) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setSearchQuery(query), 300);
  }, []);

  // Effects
  useEffect(() => { loadInitial(); }, [loadInitial]);
  useEffect(() => { 
    if (activeTab && !sections[activeTab]) loadSection(activeTab); 
  }, [activeTab, sections, loadSection]);

  /* ═══════════════════════════════════════════════════════════════════════════
     COMPUTED VALUES
     ═══════════════════════════════════════════════════════════════════════════ */

  const sectionCounts = RESOURCE_TYPES.reduce((acc, type) => ({
    ...acc, [type.key]: counts[type.key] || 0
  }), {});

  const totalFiles = Object.values(sectionCounts).reduce((a, b) => a + b, 0);
  const activeType = RESOURCE_TYPES.find(t => t.key === activeTab);
  
  const noteModules = Array.isArray(sections.notes?.notes?.modules) ? sections.notes.notes.modules : [];
  const noteGeneral = Array.isArray(sections.notes?.notes?.general) ? sections.notes.notes.general : [];
  const flatResources = Array.isArray(sections[activeTab]?.resources) ? sections[activeTab].resources : [];
  
  // Memoized filtered resources with proper error handling
  const filteredFlat = useMemo(() => {
    if (!searchQuery) return flatResources;
    return searchResources(flatResources, searchQuery);
  }, [flatResources, searchQuery]);

  const filteredModules = useMemo(() => {
    if (!searchQuery) return noteModules;
    return noteModules
      .map(m => ({
        ...m,
        resources: Array.isArray(m.resources) ? searchResources(m.resources, searchQuery) : []
      }))
      .filter(m => m.resources.length > 0);
  }, [noteModules, searchQuery]);

  const filteredGeneral = useMemo(() => {
    if (!searchQuery) return noteGeneral;
    return searchResources(noteGeneral, searchQuery);
  }, [noteGeneral, searchQuery]);

  const hasCourseInfo = subject?.courseObjectives?.length > 0 || 
                        subject?.courseOutcomes?.length > 0 || 
                        subject?.referenceBooks?.length > 0 ||
                        subject?.courseHandoutUrl ||
                        subject?.syllabus;

  /* ═══════════════════════════════════════════════════════════════════════════
     LOADING STATE - SKELETON LOADERS
     ═══════════════════════════════════════════════════════════════════════════ */

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        {/* Header Skeleton */}
        <div className="mb-5 animate-pulse">
          <div className="mb-4 h-10 w-24 bg-white/5 rounded-lg" />
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6">
            <div className="h-9 w-3/4 bg-white/10 rounded-lg mb-4" />
            <div className="flex flex-wrap gap-2 mb-5">
              <div className="h-8 w-20 bg-white/10 rounded-lg" />
              <div className="h-8 w-16 bg-white/10 rounded-lg" />
              <div className="h-8 w-24 bg-white/10 rounded-lg" />
            </div>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 w-24 bg-white/10 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="mb-5 animate-pulse">
          <div className="h-12 w-full bg-white/5 rounded-xl" />
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-5 animate-pulse">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-11 w-28 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="w-11 h-11 bg-white/10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-white/10 rounded" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-9 flex-1 bg-white/10 rounded-lg" />
                    <div className="h-9 w-20 bg-white/10 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Subject not found</p>
          <button 
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen pb-20">
      {/* ═══════════════ SECTION 1: CLEAN ACADEMIC HEADER ═══════════════ */}
      <div className="mb-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors active:scale-95 min-h-[44px]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Clean Subject Header */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 backdrop-blur-sm">
          {/* Subject Name */}
          <h1 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight uppercase tracking-wide">
            {subject.name}
          </h1>

          {/* Academic Info Chips - Consistent Visual Hierarchy */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {subject.code && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                {subject.code}
              </span>
            )}
            {(subject.branchId?.code || subject.branchId?.name) && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                {subject.branchId?.code || subject.branchId?.name}
              </span>
            )}
            {(subject.semesterId?.number || subject.semesterNumber) && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                Semester {subject.semesterId?.number || subject.semesterNumber}
              </span>
            )}
            {(subject.schemeId?.label || subject.scheme) && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/25">
                {subject.schemeId?.label || subject.scheme}
              </span>
            )}
            {subject.credits && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                {subject.credits} Credits
              </span>
            )}
            {(subject.lectureHours !== null || subject.tutorialHours !== null || subject.practicalHours !== null) && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                L-T-P: {subject.lectureHours || 0}-{subject.tutorialHours || 0}-{subject.practicalHours || 0}
              </span>
            )}
            {subject.totalHours && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/25">
                {subject.totalHours} Hours
              </span>
            )}
          </div>

          {/* Resource Stats - Compact Single Line */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Notes:</span>
              <span className="font-bold text-indigo-300">{sectionCounts.notes}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">PYQs:</span>
              <span className="font-bold text-cyan-300">{sectionCounts.pyq}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Books:</span>
              <span className="font-bold text-purple-300">{sectionCounts.textbook}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Labs:</span>
              <span className="font-bold text-orange-300">{sectionCounts.lab}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Total:</span>
              <span className="font-bold text-white">{totalFiles}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ SECTION 2: CLEAN SEARCH BAR ═══════════════ */}
      <div className="mb-5">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search resources..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all text-sm"
          />
        </div>
      </div>

      {/* ═══════════════ SECTION 3: RESOURCE TABS (Sticky) ═══════════════ */}
      <div className="sticky top-0 z-10 -mx-4 px-4 md:mx-0 md:px-0 py-3 bg-[#020617]/90 backdrop-blur-xl mb-5 border-b border-white/5">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-1">
            {RESOURCE_TYPES.filter(type => sectionCounts[type.key] > 0).map(type => (
              <button
                key={type.key}
                onClick={() => handleTabChange(type.key)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 min-h-[44px]"
                style={{
                  background: activeTab === type.key ? `${type.color}20` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeTab === type.key ? `${type.color}40` : 'rgba(255,255,255,0.06)'}`,
                  color: activeTab === type.key ? type.color : '#94a3b8',
                  boxShadow: activeTab === type.key ? `0 4px 12px ${type.color}15` : 'none'
                }}
              >
                <span className="text-base">{type.icon}</span>
                <span className="hidden sm:inline font-semibold">{type.label}</span>
                <span className="inline sm:hidden font-semibold">{type.label.split(' ')[0]}</span>
                <span 
                  className="px-2 py-0.5 rounded-lg text-xs font-bold"
                  style={{ background: activeTab === type.key ? `${type.color}30` : 'rgba(255,255,255,0.05)' }}
                >
                  {sectionCounts[type.key]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════ SECTION 4: COURSE INFORMATION ACCORDION ═══════════════ */}
      {hasCourseInfo && (
        <div className="mb-5">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-200 hover:border-white/[0.12]">
            <button
              onClick={() => setCourseInfoOpen(!courseInfoOpen)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-all duration-200 active:scale-[0.99] min-h-[60px]"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📚</span>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Course Information</div>
                  <div className="text-xs text-slate-400 mt-0.5">Objectives, Outcomes & Resources</div>
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-slate-400 transition-all duration-300 flex-shrink-0 ${courseInfoOpen ? 'rotate-180 text-slate-300' : ''}`}
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <AnimatePresence>
              {courseInfoOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="border-t border-white/5"
                >
                  <div className="p-5 space-y-6">
                    {/* Course Handout */}
                    {subject.courseHandoutUrl && (
                      <div>
                        <a 
                          href={subject.courseHandoutUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                                {i + 1}
                              </span>
                              <span className="pt-0.5">{obj}</span>
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
                              <span className="flex-shrink-0 w-7 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                                CO{i + 1}
                              </span>
                              <span className="pt-0.5">{out}</span>
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
                            <span 
                              key={i} 
                              className="px-3 py-1.5 rounded-lg text-xs bg-purple-500/15 text-purple-300 border border-purple-500/25"
                            >
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
                        <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {subject.syllabus}
                        </div>
                      </div>
                    )}

                    {/* YouTube Videos */}
                    {subject.youtubeVideos?.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase text-red-400 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          Video Lectures
                        </h3>
                        <div className="space-y-3">
                          {subject.youtubeVideos.map((video, i) => (
                            <a
                              key={i}
                              href={`https://www.youtube.com/watch?v=${video.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-red-500/30 transition-all duration-200"
                            >
                              {/* Thumbnail */}
                              <div className="relative flex-shrink-0 w-32 h-20 rounded-md overflow-hidden bg-slate-800/50">
                                <img 
                                  src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                  <svg className="w-8 h-8 text-red-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                                {video.module && (
                                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">
                                    M{video.module}
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-slate-100 group-hover:text-white line-clamp-2 mb-1 transition-colors">
                                  {video.title}
                                </h4>
                                {video.description && (
                                  <p className="text-xs text-slate-400 line-clamp-2 mb-1">
                                    {video.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                                  </svg>
                                  <span className="text-red-400 font-medium">Watch on YouTube</span>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ═══════════════ SECTION 5: RESOURCES CONTENT ═══════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Notes Section with Modules */}
          {activeTab === 'notes' ? (
            <div className="space-y-3">
              {filteredModules.map((module) => (
                <ModuleCard 
                  key={module.moduleNumber} 
                  {...module} 
                  color={activeType?.color || '#6366f1'} 
                />
              ))}
              
              {/* General Notes */}
              {filteredGeneral.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 px-1">General Notes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredGeneral.map(r => (
                      <ResourceCard key={r._id} resource={r} color={activeType?.color || '#6366f1'} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {filteredModules.length === 0 && filteredGeneral.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                    <span className="text-4xl opacity-50">📚</span>
                  </div>
                  <p className="text-slate-300 text-base font-medium mb-1.5">
                    {searchQuery ? 'No notes found' : 'No notes available'}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {searchQuery ? 'Try adjusting your search terms' : 'Check back later for updates'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Other Resource Types */
            <div>
              {filteredFlat.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredFlat.map(r => (
                    <ResourceCard key={r._id} resource={r} color={activeType?.color || '#6366f1'} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 border"
                    style={{ 
                      background: `${activeType?.color}10`, 
                      borderColor: `${activeType?.color}20` 
                    }}
                  >
                    <span className="text-4xl opacity-50">{activeType?.icon}</span>
                  </div>
                  <p className="text-slate-300 text-base font-medium mb-1.5">
                    {searchQuery ? `No ${activeType?.label.toLowerCase()} found` : `No ${activeType?.label.toLowerCase()} available`}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {searchQuery ? 'Try adjusting your search terms' : 'Check back later for updates'}
                  </p>
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
