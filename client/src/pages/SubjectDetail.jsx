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
  if (!query?.trim()) return resources;
  const q = query.toLowerCase().trim();
  return resources.filter(r => 
    r.title?.toLowerCase().includes(q) ||
    r.description?.toLowerCase().includes(q) ||
    r.unitTitle?.toLowerCase().includes(q)
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
      fetch(`/api/resources/${resource._id}/download`, { method: 'POST' }).catch(() => {});
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
        className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/10 rounded-lg p-3 transition-all"
      >
        <div className="flex items-start gap-3">
          {/* PDF Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">
            📄
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-slate-200 line-clamp-2 mb-1 leading-snug">
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
            <div className="flex items-center gap-2 mt-2">
              {isPdf && (
                <button
                  onClick={() => setPreviewing(true)}
                  className="flex-1 min-h-[36px] md:min-h-[32px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                  style={{ background: `${color}20`, color: color, border: `1px solid ${color}40` }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  Preview
                </button>
              )}
              <button
                onClick={handleDownload}
                className="min-h-[36px] md:min-h-[32px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
      >
        <div 
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold border"
          style={{ background: `${color}15`, color: color, borderColor: `${color}30` }}
        >
          {moduleNumber}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-semibold text-white">Module {moduleNumber}</div>
          <div className="text-xs text-slate-500">{resources.length} {resources.length === 1 ? 'File' : 'Files'}</div>
        </div>
        <svg 
          className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
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
            transition={{ duration: 0.2 }}
            className="border-t border-white/5"
          >
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
  
  const noteModules = sections.notes?.notes?.modules || [];
  const noteGeneral = sections.notes?.notes?.general || [];
  const flatResources = sections[activeTab]?.resources || [];
  
  const filteredFlat = searchQuery ? searchResources(flatResources, searchQuery) : flatResources;
  const filteredModules = searchQuery 
    ? noteModules.map(m => ({
        ...m, 
        resources: searchResources(m.resources, searchQuery)
      })).filter(m => m.resources.length > 0) 
    : noteModules;

  const hasCourseInfo = subject?.courseObjectives?.length > 0 || 
                        subject?.courseOutcomes?.length > 0 || 
                        subject?.referenceBooks?.length > 0 ||
                        subject?.courseHandoutUrl ||
                        subject?.syllabus;

  /* ═══════════════════════════════════════════════════════════════════════════
     LOADING STATE
     ═══════════════════════════════════════════════════════════════════════════ */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
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
      {/* ═══════════════ SECTION 1: COMPACT HERO HEADER ═══════════════ */}
      <div className="mb-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-3 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
          <span className="text-sm">Back</span>
        </button>

        {/* Hero Card - Max Height 220px */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 rounded-xl p-4 md:p-5 backdrop-blur-sm">
          {/* Subject Name */}
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
            {subject.name}
          </h1>

          {/* Academic Info Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {subject.code && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {subject.code}
              </span>
            )}
            {subject.semesterNumber && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Sem {subject.semesterNumber}
              </span>
            )}
            {subject.scheme && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {subject.scheme}
              </span>
            )}
            {subject.credits && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {subject.credits} Credits
              </span>
            )}
            {(subject.lectureHours || subject.tutorialHours || subject.practicalHours) && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {subject.lectureHours || 0}-{subject.tutorialHours || 0}-{subject.practicalHours || 0}
              </span>
            )}
          </div>

          {/* Resource Stats - Horizontal Scroll on Mobile */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            <div className="flex-shrink-0 px-3 py-2 rounded-lg bg-indigo-500/15 border border-indigo-500/25">
              <div className="text-lg font-bold text-white">{sectionCounts.notes}</div>
              <div className="text-xs text-slate-400">Notes</div>
            </div>
            <div className="flex-shrink-0 px-3 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/25">
              <div className="text-lg font-bold text-white">{sectionCounts.pyq}</div>
              <div className="text-xs text-slate-400">PYQs</div>
            </div>
            <div className="flex-shrink-0 px-3 py-2 rounded-lg bg-purple-500/15 border border-purple-500/25">
              <div className="text-lg font-bold text-white">{sectionCounts.textbook}</div>
              <div className="text-xs text-slate-400">Books</div>
            </div>
            <div className="flex-shrink-0 px-3 py-2 rounded-lg bg-orange-500/15 border border-orange-500/25">
              <div className="text-lg font-bold text-white">{sectionCounts.lab}</div>
              <div className="text-xs text-slate-400">Labs</div>
            </div>
            <div className="flex-shrink-0 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <div className="text-lg font-bold text-white">{totalFiles}</div>
              <div className="text-xs text-slate-400">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ SECTION 2: SEARCH BAR ═══════════════ */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search resources..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-12 md:h-11 pl-10 pr-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all text-sm"
          />
        </div>
      </div>

      {/* ═══════════════ SECTION 3: RESOURCE TABS (Sticky) ═══════════════ */}
      <div className="sticky top-0 z-10 -mx-4 px-4 md:mx-0 md:px-0 py-2 bg-[#020617]/80 backdrop-blur-md mb-4">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-1">
            {RESOURCE_TYPES.filter(type => sectionCounts[type.key] > 0).map(type => (
              <button
                key={type.key}
                onClick={() => handleTabChange(type.key)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: activeTab === type.key ? `${type.color}20` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeTab === type.key ? `${type.color}40` : 'rgba(255,255,255,0.06)'}`,
                  color: activeTab === type.key ? type.color : '#94a3b8',
                }}
              >
                <span>{type.icon}</span>
                <span className="hidden sm:inline">{type.label}</span>
                <span className="inline sm:hidden">{type.label.split(' ')[0]}</span>
                <span 
                  className="px-1.5 py-0.5 rounded text-xs font-bold"
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
        <div className="mb-4">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden">
            <button
              onClick={() => setCourseInfoOpen(!courseInfoOpen)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📚</span>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Course Information</div>
                  <div className="text-xs text-slate-500">Objectives, Outcomes & Resources</div>
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${courseInfoOpen ? 'rotate-180' : ''}`}
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
                  transition={{ duration: 0.2 }}
                  className="border-t border-white/5"
                >
                  <div className="p-4 space-y-5">
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
              {noteGeneral.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 px-1">General Notes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {noteGeneral.map(r => (
                      <ResourceCard key={r._id} resource={r} color={activeType?.color || '#6366f1'} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {filteredModules.length === 0 && noteGeneral.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4 opacity-20">📚</div>
                  <p className="text-slate-400 text-sm">
                    {searchQuery ? 'No notes found matching your search' : 'No notes available yet'}
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
                <div className="text-center py-16">
                  <div className="text-5xl mb-4 opacity-20">{activeType?.icon}</div>
                  <p className="text-slate-400 text-sm">
                    {searchQuery ? `No ${activeType?.label.toLowerCase()} found matching your search` : `No ${activeType?.label.toLowerCase()} available yet`}
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
