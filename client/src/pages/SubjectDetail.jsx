import { useEffect, useState, useCallback } from 'react';
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
   FILE ROW — single resource with inline PDF viewer
───────────────────────────────────────────────────────────────────────────── */
const FileRow = ({ resource, color, rgb, isLast }) => {
  const [hovered,  setHovered]  = useState(false);
  const [expanded, setExpanded] = useState(false);
  // Check if it's a PDF - also check for Cloudinary URLs with parameters
  const isPdf = resource.fileUrl?.toLowerCase().includes('.pdf') || resource.type === 'notes' || resource.type === 'question-papers';

  const trackDownload = () => {
    if (resource._id) fetch(`/api/resources/${resource._id}/download`, { method: 'POST' }).catch(() => {});
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
          <a href={resource.fileUrl} download onClick={e => { e.stopPropagation(); trackDownload(); }}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
              color: hovered ? '#e2e8f0' : '#64748b',
            }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Save
          </a>
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
};

/* ─────────────────────────────────────────────────────────────────────────────
   MODULE ACCORDION — used inside the Notes section
───────────────────────────────────────────────────────────────────────────── */
const ModuleAccordion = ({ moduleNumber, unitTitle, resources, defaultOpen }) => {
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
};

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION CARD — wraps each of the 9 sections
───────────────────────────────────────────────────────────────────────────── */
const SectionCard = ({ section, count, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const { label, icon, color, rgb, desc } = section;
  const hasContent = count > 0;

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
      <button type="button" onClick={() => setOpen(v => !v)}
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
              {hasContent ? children : (
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
  const [data,     setData]     = useState(null);   // full structured response
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const load = useCallback(() => {
    setLoading(true); setError('');
    Promise.all([
      api.get(`/api/vtu/subjects/${subjectId}`),
      api.get(`/api/subjects/${subjectId}/resources`),
    ])
      .then(([sr, rr]) => {
        setSubject(sr.data || null);
        setData(rr.data || null);
      })
      .catch(() => setError('Failed to load subject data. Please try again.'))
      .finally(() => setLoading(false));
  }, [subjectId]);

  useEffect(() => { load(); }, [load]);

  // Derive counts for each section
  const counts = {
    notes:      (data?.notes?.total) || 0,
    pyq:        (data?.pyq?.length)  || 0,
    model:      (data?.model?.length)|| 0,
    textbook:   (data?.textbook?.length) || 0,
    lab:        (data?.lab?.length)  || 0,
    important:  (data?.important?.length) || 0,
    assignment: (data?.assignment?.length) || 0,
    reference:  (data?.reference?.length) || 0,
    handout:    data?.handout ? 1 : 0,
  };

  const totalFiles = data?.total || 0;
  const noteModules = data?.notes?.modules || [];
  const noteGeneral = data?.notes?.general || [];

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
      {!loading && data && (
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map(s => {
            const c = counts[s.key] || 0;
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
              <SectionCard section={s} count={counts.notes} defaultOpen={counts.notes > 0}>
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
            const items = data?.[key] || [];
            return (
              <SectionCard key={key} section={s} count={items.length} defaultOpen={false}>
                <div className="space-y-0">
                  {items.map((r, i) => (
                    <FileRow key={r._id} resource={r} color={s.color} rgb={s.rgb} isLast={i === items.length - 1} />
                  ))}
                </div>
              </SectionCard>
            );
          })}

          {/* 9. COURSE HANDOUT — special card */}
          <HandoutCard handout={data?.handout || null} section={SECTIONS.find(x => x.key === 'handout')} />

        </div>
      )}
    </div>
  );
};

export default SubjectDetail;
