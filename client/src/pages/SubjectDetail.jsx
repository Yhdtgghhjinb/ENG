import { useEffect, useState, useCallback, memo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';
import Breadcrumbs from '../components/Breadcrumbs';

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION DEFINITIONS — order, icon, colour, label
───────────────────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { key: 'notes',      label: 'Notes',               icon: '\u{1F4D6}', color: '#818cf8', rgb: '129,140,248',  desc: 'Module-wise lecture notes' },
  { key: 'pyq',        label: 'Question Papers',      icon: '\u{1F4C3}', color: '#38bdf8', rgb: '56,189,248',   desc: 'Previous year exam papers' },
  { key: 'model',      label: 'Model Papers',         icon: '\u{1F4DD}', color: '#34d399', rgb: '52,211,153',   desc: 'Model question papers' },
  { key: 'textbook',   label: 'Textbooks',            icon: '\u{1F4DA}', color: '#2dd4bf', rgb: '45,212,191',   desc: 'Reference books & textbooks' },
  { key: 'lab',        label: 'Lab Manuals',          icon: '\u{1F9EA}', color: '#fbbf24', rgb: '251,191,36',   desc: 'Lab programs & manuals' },
  { key: 'important',  label: 'Important Questions',  icon: '\u2B50',    color: '#fb7185', rgb: '251,113,133',  desc: 'Curated important questions' },
  { key: 'assignment', label: 'Assignments',          icon: '\u{1F4CB}', color: '#f97316', rgb: '249,115,22',   desc: 'Assignments & exercises' },
  { key: 'reference',  label: 'Reference Material',   icon: '\u{1F4CE}', color: '#a78bfa', rgb: '167,139,250',  desc: 'Additional reference material' },
  { key: 'handout',    label: 'Course Handout',       icon: '\u{1F4F0}', color: '#e879f9', rgb: '232,121,249',  desc: 'Official course handout' },
];

const MODULE_COLORS = [
  { color: '#818cf8', rgb: '129,140,248' },
  { color: '#38bdf8', rgb: '56,189,248'  },
  { color: '#34d399', rgb: '52,211,153'  },
  { color: '#fb7185', rgb: '251,113,133' },
  { color: '#fbbf24', rgb: '251,191,36'  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   FILE ROW — single resource with inline PDF viewer (MEMOIZED)
───────────────────────────────────────────────────────────────────────────── */
const FileRow = memo(({ resource, color, rgb, isLast }) => {
  const [hovered,  setHovered]  = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Check if it's a PDF - treat all resource types as PDFs with preview capability
  const isPdf = resource.fileUrl?.toLowerCase().includes('.pdf') || 
    ['notes', 'pyq', 'model', 'textbook', 'lab', 'important', 'assignment', 'reference', 'handout'].includes(resource.type);

  const trackDownload = () => {
    if (resource._id) fetch(`/api/resources/${resource._id}/download`, { method: 'POST' }).catch(() => {});
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    trackDownload();
    
    try {
      // For Cloudinary or cross-origin files, we need to fetch and download
      const response = await fetch(resource.fileUrl);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resource.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf' || 'download.pdf';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback: open in new tab if fetch fails (CORS issue)
      console.error('Download failed, opening in new tab:', error);
      window.open(resource.fileUrl, '_blank');
    }
  };

  const handleShare = async (platform) => {
    const shareUrl = window.location.origin + window.location.pathname + '#' + resource._id;
    const shareText = `Check out this resource: ${resource.title || 'Study Material'}`;
    
    switch(platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
            setShowShareMenu(false);
          }, 2000);
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
            setShowShareMenu(false);
          }, 2000);
        }
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        setShowShareMenu(false);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        setShowShareMenu(false);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        setShowShareMenu(false);
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: resource.title || 'Study Material',
              text: shareText,
              url: shareUrl,
            });
            setShowShareMenu(false);
          } catch (err) {
            console.log('Share cancelled');
          }
        }
        break;
    }
  };

  return (
    <>
      <div
        className="flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-all duration-200"
        style={{
          background: hovered || expanded ? `rgba(${rgb},0.1)` : 'rgba(255,255,255,0.025)',
          border: `1px solid ${hovered || expanded ? `rgba(${rgb},0.35)` : 'rgba(255,255,255,0.04)'}`,
          transform: hovered ? 'translateX(4px)' : 'translateX(0)',
          boxShadow: hovered ? `0 4px 16px rgba(${rgb},0.18)` : 'none',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Icon */}
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm transition-all duration-200"
          style={{
            background: hovered ? `rgba(${rgb},0.22)` : `rgba(${rgb},0.12)`,
            border: `1px solid rgba(${rgb},${hovered ? '0.5' : '0.22'})`,
            boxShadow: hovered ? `0 0 14px rgba(${rgb},0.35)` : 'none',
          }}>
          &#x1F4C4;
        </div>

        {/* Title + subtitle */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-snug transition-colors duration-200"
            style={{ color: hovered ? '#f1f5f9' : '#94a3b8' }}>
            {resource.title}
          </p>
          {(resource.unitTitle || resource.description) && (
            <p className="mt-0.5 truncate text-[11px]" style={{ color: `rgba(${rgb},0.65)` }}>
              {resource.unitTitle || resource.description}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {isPdf ? (
            <button type="button" onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: expanded ? `linear-gradient(135deg,rgba(${rgb},1),rgba(${rgb},0.7))` : `linear-gradient(135deg,${color}ee,${color}88)`,
                boxShadow: `0 2px 8px rgba(${rgb},0.3)`,
                border: `1px solid rgba(${rgb},0.45)`,
              }}>
              {expanded
                ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>Close</>
                : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Open</>
              }
            </button>
          ) : (
            <a href={resource.fileUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg,${color}ee,${color}88)`, boxShadow: `0 2px 8px rgba(${rgb},0.25)`, border: `1px solid rgba(${rgb},0.45)` }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Open
            </a>
          )}
          <button type="button" onClick={handleDownload}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
              color: hovered ? '#e2e8f0' : '#64748b',
            }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Save
          </button>
          {/* Share Button */}
          <div className="relative">
            <button type="button" onClick={e => { e.stopPropagation(); setShowShareMenu(v => !v); }}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: showShareMenu ? 'rgba(59,130,246,0.15)' : (hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'),
                border: `1px solid ${showShareMenu ? 'rgba(59,130,246,0.3)' : (hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)')}`,
                color: showShareMenu ? '#60a5fa' : (hovered ? '#e2e8f0' : '#64748b'),
              }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
            
            {/* Share Menu Dropdown */}
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50"
                style={{
                  background: 'rgba(15,23,42,0.98)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(20px)'
                }}
                onClick={e => e.stopPropagation()}>
                <button onClick={() => handleShare('copy')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                  {copied ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg><span style={{color:'#10b981'}}>Link Copied!</span></>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>Copy Link</>
                  )}
                </button>
                {navigator.share && (
                  <button onClick={() => handleShare('native')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    More Options
                  </button>
                )}
                <div className="h-px mx-2" style={{background:'rgba(255,255,255,0.05)'}}/>
                <button onClick={() => handleShare('whatsapp')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  WhatsApp
                </button>
                <button onClick={() => handleShare('telegram')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0088cc" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Telegram
                </button>
                <button onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1DA1F2" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                  Twitter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline PDF viewer */}
      <AnimatePresence>
        {expanded && isPdf && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 520 }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden rounded-2xl"
            style={{ border: `1px solid rgba(${rgb},0.3)`, boxShadow: `0 8px 32px rgba(0,0,0,0.5)`, marginTop: 4, marginBottom: 4 }}>
            <div className="flex items-center justify-between px-4 py-2.5"
              style={{ background: `rgba(${rgb},0.12)`, borderBottom: `1px solid rgba(${rgb},0.2)` }}>
              <span className="max-w-[260px] truncate text-xs font-medium text-slate-300">{resource.title}</span>
              <div className="flex items-center gap-2">
                <a href={`https://docs.google.com/viewer?url=${encodeURIComponent(resource.fileUrl)}&embedded=true`} target="_blank" rel="noreferrer" className="text-[11px] text-slate-500 hover:text-slate-300">Open in new tab ↗</a>
                <button type="button" onClick={() => setExpanded(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 hover:text-slate-200"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>✕</button>
              </div>
            </div>
            <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(resource.fileUrl)}&embedded=true`} title={resource.title} className="w-full" style={{ height: 468, border: 'none', background: '#0a0f1e' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {!isLast && !expanded && (
        <div className="mx-3.5 h-px" style={{ background: `linear-gradient(90deg,rgba(${rgb},0.2),transparent 75%)` }} />
      )}
    </>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   MODULE ACCORDION — used inside the Notes section (MEMOIZED)
───────────────────────────────────────────────────────────────────────────── */
const ModuleAccordion = memo(({ moduleNumber, unitTitle, resources, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);
  const mc = MODULE_COLORS[(moduleNumber - 1) % MODULE_COLORS.length];

  return (
    <div className="overflow-hidden rounded-2xl transition-all duration-200"
      style={{
        border: `1px solid rgba(${mc.rgb},${open ? '0.35' : '0.15'})`,
        background: open ? `rgba(${mc.rgb},0.05)` : 'rgba(255,255,255,0.02)',
        boxShadow: open ? `0 4px 24px rgba(${mc.rgb},0.12)` : 'none',
      }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors duration-200"
        style={{ background: open ? `rgba(${mc.rgb},0.08)` : 'transparent' }}>
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black"
            style={{ background: `rgba(${mc.rgb},0.18)`, border: `1px solid rgba(${mc.rgb},0.4)`, color: mc.color, boxShadow: open ? `0 0 16px rgba(${mc.rgb},0.35)` : 'none' }}>
            {moduleNumber}
          </div>
          <div>
            <p className="text-[15px] font-bold text-white">Module {moduleNumber}</p>
            <p className="text-[11px]" style={{ color: `rgba(${mc.rgb},0.7)` }}>
              {unitTitle ? `${unitTitle} · ` : ''}{resources.length} file{resources.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={mc.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden">
            <div className="space-y-0 px-4 pb-4 pt-1">
              {resources.map((r, i) => (
                <FileRow key={r._id} resource={r} color={mc.color} rgb={mc.rgb} isLast={i === resources.length - 1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION CARD — wraps each of the 9 sections (LAZY LOADING)
───────────────────────────────────────────────────────────────────────────── */
const SectionCard = ({ section, count, children, defaultOpen = false, subjectId, onLoad }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(defaultOpen); // Track if resources have been loaded
  const { label, icon, color, rgb, desc, key } = section;
  const hasContent = count > 0;

  // Lazy load resources when section is expanded
  const handleToggle = useCallback(async () => {
    const newOpen = !open;
    setOpen(newOpen);
    
    // Load resources only when opening for the first time
    if (newOpen && !loaded && hasContent && onLoad) {
      setLoading(true);
      try {
        await onLoad(key);
        setLoaded(true);
      } catch (error) {
        console.error(`Failed to load ${label}:`, error);
      } finally {
        setLoading(false);
      }
    }
  }, [open, loaded, hasContent, onLoad, key, label]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="overflow-hidden rounded-3xl"
      style={{
        border: `1px solid rgba(${rgb},${open ? '0.3' : '0.12'})`,
        background: open
          ? `linear-gradient(145deg, rgba(${rgb},0.07) 0%, rgba(4,7,20,0.92) 100%)`
          : 'rgba(255,255,255,0.02)',
        boxShadow: open ? `0 8px 32px rgba(${rgb},0.1)` : 'none',
        transition: 'all 0.25s ease',
      }}>
      {/* Section header */}
      <button type="button" onClick={handleToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors duration-200"
        style={{ background: open ? `rgba(${rgb},0.06)` : 'transparent' }}>
        <div className="flex items-center gap-4">
          {/* Icon box */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl transition-all duration-300"
            style={{
              background: open ? `rgba(${rgb},0.22)` : `rgba(${rgb},0.12)`,
              border: `1px solid rgba(${rgb},${open ? '0.5' : '0.25'})`,
              boxShadow: open ? `0 0 20px rgba(${rgb},0.4)` : 'none',
            }}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <p className="text-[16px] font-bold text-white">{label}</p>
              {/* Count badge */}
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                style={{
                  background: hasContent ? `rgba(${rgb},0.2)` : 'rgba(71,85,105,0.2)',
                  color: hasContent ? color : '#475569',
                  border: `1px solid rgba(${rgb},${hasContent ? '0.35' : '0.1'})`,
                }}>
                {count}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">{desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Accent bar */}
          {hasContent && (
            <div className="hidden h-1.5 w-16 overflow-hidden rounded-full sm:block"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: '100%', background: `linear-gradient(90deg,${color},rgba(${rgb},0.4))` }} />
            </div>
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={open ? color : '#475569'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {/* Accent top line */}
      {open && (
        <div className="h-px mx-6" style={{ background: `linear-gradient(90deg,rgba(${rgb},0.4),transparent)` }} />
      )}

      {/* Content */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden">
            <div className="px-5 pb-5 pt-3">
              {loading ? (
                <div className="flex items-center justify-center py-8 gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                    style={{ borderColor: color }}/>
                  <p className="text-sm text-slate-400">Loading {label.toLowerCase()}...</p>
                </div>
              ) : hasContent ? children : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: `rgba(${rgb},0.08)`, border: `1px dashed rgba(${rgb},0.2)` }}>
                    {icon}
                  </div>
                  <p className="text-sm font-semibold text-slate-600">No {label.toLowerCase()} yet</p>
                  <p className="mt-1 text-[11px] text-slate-700">Upload from the admin panel</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   YOUTUBE VIDEO CARD — Display YouTube videos
───────────────────────────────────────────────────────────────────────────── */
const YouTubeVideoCard = ({ video, index }) => {
  const [playing, setPlaying] = useState(false);
  const colors = MODULE_COLORS[index % MODULE_COLORS.length];
  
  return (
    <div className="overflow-hidden rounded-2xl transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid rgba(${colors.rgb},0.2)`,
      }}>
      {!playing ? (
        <div className="relative cursor-pointer group" onClick={() => setPlaying(true)}>
          <img 
            src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
            alt={video.title}
            className="w-full aspect-video object-cover"
            onError={(e) => {
              e.target.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
            }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
              style={{
                background: 'rgba(255,0,0,0.9)',
                boxShadow: '0 8px 32px rgba(255,0,0,0.4)',
              }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <polygon points="8 5 19 12 8 19 8 5"/>
              </svg>
            </div>
          </div>
          {video.module && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold"
              style={{
                background: `rgba(${colors.rgb},0.9)`,
                color: 'white',
                backdropFilter: 'blur(10px)'
              }}>
              Module {video.module}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      
      <div className="p-4">
        <h4 className="text-sm font-bold text-white mb-1 line-clamp-2">{video.title}</h4>
        {video.description && (
          <p className="text-xs text-slate-400 line-clamp-2">{video.description}</p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'rgba(255,0,0,0.15)',
              border: '1px solid rgba(255,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Watch on YouTube
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   HANDOUT CARD — special highlighted card for course handout
───────────────────────────────────────────────────────────────────────────── */
const HandoutCard = ({ handout, section }) => {
  const [expanded, setExpanded] = useState(false);
  const { color, rgb, icon, label, desc } = section;
  const isPdf = handout?.fileUrl?.toLowerCase().endsWith('.pdf');

  const trackDownload = () => {
    if (handout?._id) fetch(`/api/resources/${handout._id}/download`, { method: 'POST' }).catch(() => {});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="overflow-hidden rounded-3xl"
      style={{
        background: `linear-gradient(145deg, rgba(${rgb},0.12) 0%, rgba(4,7,20,0.92) 100%)`,
        border: `1px solid rgba(${rgb},0.3)`,
        boxShadow: `0 8px 32px rgba(${rgb},0.12)`,
      }}>
      {/* Top accent */}
      <div className="h-0.5" style={{ background: `linear-gradient(90deg,${color},rgba(${rgb},0.3),transparent)` }} />

      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-2xl"
            style={{ background: `rgba(${rgb},0.2)`, border: `1px solid rgba(${rgb},0.45)`, boxShadow: `0 0 24px rgba(${rgb},0.35)` }}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-bold text-white">{label}</p>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: `rgba(${rgb},0.2)`, color, border: `1px solid rgba(${rgb},0.35)` }}>
                Official
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-slate-400">{handout ? handout.title : desc}</p>
          </div>
        </div>

        {handout ? (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isPdf && (
              <button type="button" onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: `rgba(${rgb},0.2)`, border: `1px solid rgba(${rgb},0.35)` }}>
                {expanded ? 'Close' : 'Preview'}
              </button>
            )}
            <a href={handout.fileUrl} download onClick={trackDownload}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg,${color}ee,${color}88)`, boxShadow: `0 2px 8px rgba(${rgb},0.3)`, border: `1px solid rgba(${rgb},0.45)` }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </a>
          </div>
        ) : (
          <p className="text-[12px] text-slate-600">No handout uploaded yet</p>
        )}
      </div>

      {/* Inline preview */}
      <AnimatePresence>
        {expanded && isPdf && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 520, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden" style={{ borderTop: `1px solid rgba(${rgb},0.15)` }}>
            <iframe src={handout.fileUrl} title="Course Handout" className="w-full" style={{ height: 520, border: 'none', background: '#0a0f1e' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   COURSE INFO — collapsible metadata panel
───────────────────────────────────────────────────────────────────────────── */
const CourseInfo = ({ subject }) => {
  const [open, setOpen] = useState(false);
  const hasInfo = subject.courseObjectives?.length || subject.courseOutcomes?.length ||
    subject.referenceBooks?.length || subject.credits || subject.lectureHours;
  if (!hasInfo) return null;

  return (
    <div className="overflow-hidden rounded-3xl"
      style={{ background: 'linear-gradient(145deg,rgba(8,13,26,0.85),rgba(4,7,20,0.9))', border: '1px solid rgba(99,102,241,0.15)' }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors duration-200 hover:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
            &#x1F4CB;
          </div>
          <div>
            <p className="text-[15px] font-bold text-white">Course Information</p>
            <p className="text-[11px] text-slate-500">Objectives, outcomes, hours &amp; reference books</p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden">
            <div className="space-y-6 px-6 pb-6">
              <div className="h-px" style={{ background: 'linear-gradient(90deg,rgba(99,102,241,0.3),transparent)' }} />
              {(subject.credits || subject.lectureHours || subject.totalHours) && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[
                    { label: 'Credits',   value: subject.credits,                                          color: '#818cf8' },
                    { label: 'Lecture',   value: subject.lectureHours   ? `${subject.lectureHours}h`   : null, color: '#38bdf8' },
                    { label: 'Tutorial',  value: subject.tutorialHours  ? `${subject.tutorialHours}h`  : null, color: '#34d399' },
                    { label: 'Practical', value: subject.practicalHours ? `${subject.practicalHours}h` : null, color: '#fbbf24' },
                    { label: 'Total Hrs', value: subject.totalHours     ? `${subject.totalHours}h`     : null, color: '#fb7185' },
                  ].filter(i => i.value != null).map(({ label, value, color }) => (
                    <div key={label} className="rounded-2xl p-3 text-center"
                      style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
                      <p className="text-xl font-black" style={{ color }}>{value}</p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2">
                {subject.courseObjectives?.length > 0 && (
                  <div>
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-indigo-400">Course Objectives</p>
                    <ul className="space-y-2">
                      {subject.courseObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-400">
                          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                            style={{ background: 'rgba(99,102,241,0.18)', color: '#818cf8' }}>{i + 1}</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {subject.courseOutcomes?.length > 0 && (
                  <div>
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-emerald-400">Course Outcomes</p>
                    <ul className="space-y-2">
                      {subject.courseOutcomes.map((out, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-400">
                          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                            style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>CO{i + 1}</span>
                          {out}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {subject.referenceBooks?.length > 0 && (
                <div>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-teal-400">Reference Books</p>
                  <div className="flex flex-wrap gap-2">
                    {subject.referenceBooks.map((book, i) => (
                      <span key={i} className="rounded-xl px-3 py-1.5 text-[12px] text-slate-300"
                        style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)' }}>
                        &#x1F4DA; {book}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="space-y-3">
    {[1,2,3,4,5].map(i => <div key={i} className="skeleton rounded-3xl" style={{ height: 76 }} />)}
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
const SubjectDetail = () => {
  const { subjectId } = useParams();
  const [subject,  setSubject]  = useState(null);
  const [counts,   setCounts]   = useState({});
  const [sections, setSections] = useState({}); // Lazy-loaded section data
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // Initial fast load - only metadata and counts
  const loadInitial = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [sr, cr] = await Promise.all([
        api.get(`/api/vtu/subjects/${subjectId}`),
        api.get(`/api/subjects/${subjectId}/counts`),
      ]);
      setSubject(sr.data || null);
      setCounts(cr.data?.counts || {});
    } catch (err) {
      setError('Failed to load subject data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  // Lazy load a specific section when user expands it
  const loadSection = useCallback(async (sectionKey) => {
    if (sections[sectionKey]) return; // Already loaded
    
    try {
      const response = await api.get(`/api/subjects/${subjectId}/resources`, {
        params: { section: sectionKey, limit: 100 }
      });
      
      const data = response.data;
      setSections(prev => ({
        ...prev,
        [sectionKey]: {
          resources: data[sectionKey] || [],
          notes: data.notes || null,
          handout: data.handout || null,
        }
      }));
    } catch (err) {
      console.error(`Failed to load section ${sectionKey}:`, err);
      throw err;
    }
  }, [subjectId, sections]);

  useEffect(() => { loadInitial(); }, [loadInitial]);

  // Derive counts for each section
  const sectionCounts = {
    notes:      counts.notes || 0,
    pyq:        counts.pyq || 0,
    model:      counts.model || 0,
    textbook:   counts.textbook || 0,
    lab:        counts.lab || 0,
    important:  counts.important || 0,
    assignment: counts.assignment || 0,
    reference:  counts.reference || 0,
    handout:    counts.handout || 0,
  };

  const totalFiles = Object.values(sectionCounts).reduce((a, b) => a + b, 0);
  const noteModules = sections.notes?.notes?.modules || [];
  const noteGeneral = sections.notes?.notes?.general || [];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/home' }, { label: subject?.name || 'Subject' }]} />

      {error && (
        <div className="rounded-2xl p-4 text-sm text-red-300"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* ── Subject hero ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl p-8"
        style={{
          background: 'linear-gradient(138deg,rgba(99,102,241,0.3) 0%,rgba(139,92,246,0.18) 45%,rgba(4,7,20,0.94) 100%)',
          border: '1px solid rgba(99,102,241,0.28)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.55),transparent 70%)', filter: 'blur(44px)' }} />
        <div className="pointer-events-none absolute -bottom-14 -left-14 h-48 w-48 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.38),transparent 70%)', filter: 'blur(36px)' }} />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex flex-shrink-0 items-center justify-center rounded-2xl text-3xl"
              style={{ width: 72, height: 72, background: 'rgba(99,102,241,0.22)', border: '1px solid rgba(99,102,241,0.42)', boxShadow: '0 0 36px rgba(99,102,241,0.38)' }}>
              &#x1F4D8;
            </div>
            <div>
              <p className="section-label mb-1.5">Subject Detail</p>
              <h2 className="display-md text-white">{subject?.name || 'Loading\u2026'}</h2>
              {subject?.code && (
                <p className="mt-1.5 font-mono text-sm font-bold" style={{ color: '#818cf8' }}>{subject.code}</p>
              )}
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap items-center gap-2.5 self-start">
            <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
              style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <span className="text-lg font-black text-white">{totalFiles}</span>
              <span className="text-xs text-slate-400">files</span>
            </div>
            {noteModules.length > 0 && (
              <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
                <span className="text-lg font-black text-emerald-400">{noteModules.length}</span>
                <span className="text-xs text-slate-400">modules</span>
              </div>
            )}
            {subject?.credits && (
              <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
                style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}>
                <span className="text-lg font-black text-yellow-400">{subject.credits}</span>
                <span className="text-xs text-slate-400">credits</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Course Info ──────────────────────────────────────────────────── */}
      {subject && <CourseInfo subject={subject} />}

      {/* ── Section overview chips ───────────────────────────────────────── */}
      {!loading && (
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map(s => {
            const c = sectionCounts[s.key] || 0;
            return (
              <div key={s.key} className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all duration-200"
                style={{
                  background: c > 0 ? `rgba(${s.rgb},0.12)` : 'rgba(255,255,255,0.03)',
                  border: `1px solid rgba(${s.rgb},${c > 0 ? '0.3' : '0.08'})`,
                  color: c > 0 ? s.color : '#334155',
                }}>
                <span>{s.icon}</span>
                <span>{s.label}</span>
                <span className="rounded-full px-1.5 py-0.5 text-[10px] font-black"
                  style={{ background: c > 0 ? `rgba(${s.rgb},0.2)` : 'rgba(255,255,255,0.04)', color: c > 0 ? s.color : '#334155' }}>
                  {c}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── All sections ─────────────────────────────────────────────────── */}
      {loading ? <Skeleton /> : (
        <div className="space-y-4">

          {/* 1. NOTES — module-wise accordion */}
          {(() => {
            const s = SECTIONS.find(x => x.key === 'notes');
            return (
              <SectionCard 
                section={s} 
                count={sectionCounts.notes} 
                defaultOpen={false}
                subjectId={subjectId}
                onLoad={loadSection}>
                <div className="space-y-3">
                  {noteModules.map((m, i) => (
                    <ModuleAccordion
                      key={m.moduleNumber}
                      moduleNumber={m.moduleNumber}
                      unitTitle={m.unitTitle}
                      resources={m.resources}
                      defaultOpen={i === 0}
                    />
                  ))}
                  {/* General notes (no module assigned) */}
                  {noteGeneral.length > 0 && (
                    <div className="overflow-hidden rounded-2xl"
                      style={{ border: '1px solid rgba(148,163,184,0.15)', background: 'rgba(255,255,255,0.02)' }}>
                      <div className="flex items-center gap-3 px-5 py-3.5"
                        style={{ borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                        <span className="text-base">&#x1F4C2;</span>
                        <span className="text-[12px] font-bold text-slate-400">General Notes</span>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-slate-500"
                          style={{ background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.15)' }}>
                          {noteGeneral.length}
                        </span>
                      </div>
                      <div className="space-y-0 p-3">
                        {noteGeneral.map((r, i) => (
                          <FileRow key={r._id} resource={r} color={s.color} rgb={s.rgb} isLast={i === noteGeneral.length - 1} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            );
          })()}

          {/* 2–8. Flat sections */}
          {['pyq','model','textbook','lab','important','assignment','reference'].map(key => {
            const s = SECTIONS.find(x => x.key === key);
            const items = sections[key]?.resources || [];
            return (
              <SectionCard 
                key={key} 
                section={s} 
                count={sectionCounts[key]} 
                defaultOpen={false}
                subjectId={subjectId}
                onLoad={loadSection}>
                <div className="space-y-0">
                  {items.map((r, i) => (
                    <FileRow key={r._id} resource={r} color={s.color} rgb={s.rgb} isLast={i === items.length - 1} />
                  ))}
                </div>
              </SectionCard>
            );
          })}

          {/* YouTube Videos Section */}
          {subject?.youtubeVideos && subject.youtubeVideos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden rounded-3xl"
              style={{
                border: '1px solid rgba(255,0,0,0.2)',
                background: 'linear-gradient(145deg, rgba(255,0,0,0.05) 0%, rgba(4,7,20,0.92) 100%)',
                boxShadow: '0 8px 32px rgba(255,0,0,0.08)',
              }}>
              <div className="flex items-center gap-4 px-6 py-5"
                style={{ background: 'rgba(255,0,0,0.05)', borderBottom: '1px solid rgba(255,0,0,0.15)' }}>
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl"
                  style={{
                    background: 'rgba(255,0,0,0.15)',
                    border: '1px solid rgba(255,0,0,0.3)',
                    boxShadow: '0 0 20px rgba(255,0,0,0.25)',
                  }}>
                  🎥
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2.5">
                    <p className="text-[16px] font-bold text-white">Video Lectures</p>
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                      style={{
                        background: 'rgba(255,0,0,0.2)',
                        color: '#ff6b6b',
                        border: '1px solid rgba(255,0,0,0.35)',
                      }}>
                      {subject.youtubeVideos.length}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">Watch video tutorials and lectures</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {subject.youtubeVideos.map((video, index) => (
                  <YouTubeVideoCard key={index} video={video} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* 9. COURSE HANDOUT — special card */}
          <HandoutCard handout={sections.handout?.handout || null} section={SECTIONS.find(x => x.key === 'handout')} />

        </div>
      )}
    </div>
  );
};

export default SubjectDetail;
