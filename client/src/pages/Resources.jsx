import { useEffect, useState, useCallback, useRef, memo, useMemo } from 'react';
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

// Memoized FilterChip component to prevent unnecessary re-renders
const FilterChip = memo(({ value, active, disabled, onClick, children }) => (
  <button type="button" onClick={onClick} disabled={disabled}
    className={`chip ${active ? 'chip-active' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
    {children}
  </button>
));
FilterChip.displayName = 'FilterChip';

// Memoized ResourceCard component - only re-renders when props change
const ResourceCard = memo(({ resource, isSelected, onClick, onDownload, searchQuery, index }) => {
  // Only animate first 10 cards for better performance
  const shouldAnimate = index < 10;
  
  const CardWrapper = shouldAnimate ? motion.div : 'div';
  const animationProps = shouldAnimate ? {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, delay: index * 0.03, ease: 'easeOut' },
    whileHover: { y: -2, scale: 1.003 }
  } : {};
  
  return (
    <CardWrapper
      {...animationProps}
      className={`group rounded-2xl border p-4 text-xs shadow-lg transition cursor-pointer ${
        isSelected
          ? 'border-primary-500/50 bg-primary-600/8 shadow-primary-900/20'
          : 'border-slate-800/60 bg-slate-950/50 hover:border-primary-500/30 hover:bg-slate-900/70'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <p className="text-sm font-semibold text-slate-50 group-hover:text-white truncate">{resource.title}</p>
          <p className="line-clamp-1 text-[11px] text-slate-400"
            dangerouslySetInnerHTML={{ __html: highlightText(resource.description, searchQuery) }} />
        </div>
        <span className="badge flex-shrink-0">{resource.type}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-500">
        {[resource.scheme, resource.branch, `Year ${resource.year}`, `Sem ${resource.semester}`, resource.subject]
          .filter(Boolean)
          .map((tag) => (
            <span key={tag} className="rounded-full bg-slate-900/80 px-2 py-0.5 border border-slate-800/60">{tag}</span>
          ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="btn-primary px-3 py-1.5 text-[11px]" onClick={(e) => e.stopPropagation()}>Preview</a>
        <button type="button" onClick={(e) => { e.stopPropagation(); onDownload(resource); }} className="btn-ghost px-3 py-1.5 text-[11px]">Download</button>
      </div>
    </CardWrapper>
  );
});
ResourceCard.displayName = 'ResourceCard';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [searchParams] = useSearchParams();
  const [facets, setFacets] = useState({ schemes: [], branches: [], years: [], semesters: [], subjects: [], types: [] });
  const [filters, setFilters] = useState({ scheme: '', branch: '', year: '', semester: '', subject: '', type: '', q: '' });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false });
  
  // Refs for debouncing and request cancellation
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const fetchResources = async (params = {}, resetPage = false) => {
    try { 
      setLoading(true); 
      setError('');
      
      // Include pagination parameters
      const requestParams = {
        ...params,
        page: resetPage ? 1 : pagination.page,
        limit: pagination.limit
      };
      
      const res = await api.get('/api/resources', { params: requestParams });
      
      // Handle new response format with pagination
      const data = res.data;
      setResources(data.resources || []);
      
      if (data.pagination) {
        setPagination(data.pagination);
      }
      
      // Auto-select first resource if none selected
      if (!selected && data.resources?.length > 0) {
        setSelected(data.resources[0]);
      }
    } catch (err) { 
      setError('Failed to load resources. Please try again.');
      console.error('Fetch resources error:', err);
    } finally { 
      setLoading(false); 
    }
  };

  const fetchFacets = async (params = {}) => {
    try { const res = await api.get('/api/resources/facets', { params }); setFacets((p) => ({ ...p, ...(res.data || {}) })); } catch {}
  };

  useEffect(() => {
    const initial = { ...filters, subject: searchParams.get('subject') || '', q: searchParams.get('q') || '' };
    setFilters(initial); 
    fetchResources(initial, true); // Reset to page 1 on mount
    fetchFacets(initial);
    
    // Cleanup function to cancel pending requests and timers
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (nextFilters) => {
    const query = { ...nextFilters };
    if (!query.scheme) query.branch = query.year = query.semester = query.subject = '';
    if (!query.branch) query.year = query.semester = query.subject = '';
    if (!query.year) query.semester = query.subject = '';
    if (!query.semester) query.subject = '';
    setFilters(query); 
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when filters change
    fetchResources(query, true); // Reset page
    fetchFacets(query);
  };

  const handleSearchChange = useCallback(async (value) => {
    const next = { ...filters, q: value };
    setFilters(next);
    
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const trimmed = value.trim();
    
    // If search is empty, fetch immediately without debounce
    if (!trimmed) { 
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchResources({ ...next, q: '' }, true); 
      return; 
    }
    
    // Show loading state immediately for better UX
    setLoading(true);
    
    // Debounce the actual API call by 500ms
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setError('');
        
        // Create new abort controller for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        
        const requestParams = {
          query: trimmed,
          ...next,
          page: 1,
          limit: pagination.limit
        };
        
        const res = await api.get('/api/resources/search', { 
          params: requestParams,
          signal: abortController.signal // Allow request cancellation
        });
        
        const data = res.data;
        const list = data.resources || [];
        
        setResources(list);
        
        if (data.pagination) {
          setPagination(data.pagination);
        }
        
        if (!selected && list.length > 0) {
          setSelected(list[0]);
        } else if (list.length === 0) {
          setSelected(null);
        }
      } catch (err) {
        // Don't show error if request was cancelled
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return;
        }
        
        setError('Search failed. Please try again.'); 
        console.error('Search error:', err);
      } finally { 
        setLoading(false); 
      }
    }, 500); // Wait 500ms after user stops typing
  }, [filters, selected, pagination.limit]);

  const handleDownload = useCallback((res) => {
    if (!res?.fileUrl) return;
    const link = document.createElement('a');
    link.href = res.fileUrl; link.target = '_blank'; link.rel = 'noreferrer'; link.download = ''; link.click();
    toast.success('Download started');
  }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
    
    // Fetch resources with new page
    const params = { ...filters, page: newPage, limit: pagination.limit };
    
    if (filters.q?.trim()) {
      // If search is active, use search endpoint
      api.get('/api/resources/search', { 
        params: { query: filters.q.trim(), ...filters, page: newPage, limit: pagination.limit }
      })
        .then(res => {
          const data = res.data;
          setResources(data.resources || []);
          if (data.pagination) setPagination(data.pagination);
          if (data.resources?.length > 0) setSelected(data.resources[0]);
          // Scroll to top of resource list
          document.querySelector('.resource-list-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        })
        .catch(err => {
          setError('Failed to load page');
          console.error('Page change error:', err);
        });
    } else {
      // Normal fetch
      fetchResources(params, false);
      // Scroll to top of resource list
      document.querySelector('.resource-list-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [pagination.totalPages, pagination.limit, filters, fetchResources]);

  const handleFilterChange = useCallback((field, value) => {
    applyFilters({ ...filters, [field]: value });
  }, [filters, applyFilters]);

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
        <section className="glass-card gradient-border space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-slate-800/50 p-4 sm:p-5 resource-list-container">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {pagination.total > 0 
                ? `${((pagination.page - 1) * pagination.limit) + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} resources`
                : '0 resources'
              }
            </span>
            {loading && <span className="text-primary-400">Loading...</span>}
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
                <ResourceCard
                  key={r._id}
                  resource={r}
                  isSelected={selected?._id === r._id}
                  onClick={() => setSelected(r)}
                  onDownload={handleDownload}
                  searchQuery={filters.q}
                  index={i}
                />
              ))}
          </div>

          {/* Pagination Controls */}
          {!loading && resources.length > 0 && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className={`btn-ghost px-4 py-2 text-xs flex items-center gap-2 ${
                  !pagination.hasPrevPage ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Previous
              </button>

              {/* Page Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                {/* Page Number Input */}
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs text-slate-500">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={pagination.totalPages}
                    value={pagination.page}
                    onChange={(e) => {
                      const page = parseInt(e.target.value, 10);
                      if (page >= 1 && page <= pagination.totalPages) {
                        handlePageChange(page);
                      }
                    }}
                    className="w-16 px-2 py-1 text-xs bg-slate-900/50 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className={`btn-ghost px-4 py-2 text-xs flex items-center gap-2 ${
                  !pagination.hasNextPage ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
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
