import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const NAV_ITEMS = [
  {
    to: '/home', end: true, label: 'Home', badge: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: '/home/calculator', end: false, label: 'Calculator', badge: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="16" y1="18" x2="16" y2="18.01"/><line x1="12" y1="18" x2="12" y2="18.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="8" y1="10" x2="16" y2="10"/>
      </svg>
    ),
  },
];

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#020617' }}>
      <div className="bg-scene" />

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside
        className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col lg:flex"
        style={{
          background: 'rgba(3, 5, 18, 0.96)',
          backdropFilter: 'blur(48px) saturate(220%)',
          WebkitBackdropFilter: 'blur(48px) saturate(220%)',
          borderRight: '1px solid rgba(99,102,241,0.1)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3.5 px-5 pt-7 pb-6">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              boxShadow: '0 0 28px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3)',
              border: '2px solid #475569',
            }}
          >
            {/* Vault door design */}
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="24" stroke="#64748b" strokeWidth="2" fill="none"/>
              <circle cx="32" cy="32" r="18" stroke="#475569" strokeWidth="1.5" fill="none"/>
              <circle cx="32" cy="32" r="8" fill="url(#vaultGrad)" stroke="#94a3b8" strokeWidth="1"/>
              <line x1="32" y1="14" x2="32" y2="22" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="50" y1="32" x2="42" y2="32" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="50" x2="32" y2="42" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="14" y1="32" x2="22" y2="32" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="20" y1="20" x2="26" y2="26" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="44" y1="20" x2="38" y2="26" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="44" y1="44" x2="38" y2="38" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="20" y1="44" x2="26" y2="38" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="vaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
            {/* Inner shine */}
            <div className="absolute inset-0 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <p className="text-[13.5px] font-bold tracking-tight text-slate-100">VTU VAULT</p>
            <p className="text-[10px] text-slate-600">Secure Repository</p>
          </motion.div>
        </div>

        {/* Gradient divider */}
        <div className="mx-5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)' }} />

        {/* ── Nav ──────────────────────────────────────────────────────────── */}
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700">Navigation</p>

          {NAV_ITEMS.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                  isActive ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Animated active pill */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))',
                        border: '1px solid rgba(99,102,241,0.35)',
                        boxShadow: '0 0 20px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
                      }}
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}

                  {/* Hover background (non-active) */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.12)' }} />
                  )}

                  {/* Icon with glow on active */}
                  <span
                    className="relative z-10 flex-shrink-0 transition-all duration-200"
                    style={isActive ? { color: '#a5b4fc', filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.7))' } : {}}
                  >
                    {item.icon}
                  </span>

                  <span className="relative z-10 flex-1">{item.label}</span>

                  {/* Badge */}
                  {item.badge && (
                    <span className="relative z-10 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                      style={{
                        background: isActive ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.15)',
                        color: isActive ? '#c7d2fe' : '#6366f1',
                        border: '1px solid rgba(99,102,241,0.3)',
                      }}>
                      {item.badge}
                    </span>
                  )}

                  {/* Active left accent bar */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-bar"
                      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full"
                      style={{ background: 'linear-gradient(180deg, #818cf8, #6366f1)', boxShadow: '0 0 8px rgba(99,102,241,0.8)' }}
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="px-5 pb-7">
          <div className="mb-5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)' }} />

          {/* Status */}
          <div className="mb-4 flex items-center gap-2">
            <div className="live-dot" />
            <span className="text-[11px] text-slate-600">Live · No sign-up needed</span>
          </div>

          {/* Info card */}
          <div className="overflow-hidden rounded-2xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))',
              border: '1px solid rgba(99,102,241,0.15)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
            <p className="text-[11.5px] leading-relaxed text-slate-600">
              Built for VTU students.
            </p>
            <p className="mt-0.5 text-[11.5px] font-semibold" style={{ color: '#818cf8' }}>Free forever.</p>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Header - Mobile Optimized */}
        <header className="flex flex-shrink-0 items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5"
          style={{ background: 'rgba(2,6,23,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
          <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
                boxShadow: '0 0 12px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)',
                border: '1.5px solid #475569'
              }}>
              <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="24" stroke="#64748b" strokeWidth="2" fill="none"/>
                <circle cx="32" cy="32" r="18" stroke="#475569" strokeWidth="1.5" fill="none"/>
                <circle cx="32" cy="32" r="8" fill="url(#vaultGradMobile)" stroke="#94a3b8" strokeWidth="1"/>
                <line x1="32" y1="14" x2="32" y2="22" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                <line x1="50" y1="32" x2="42" y2="32" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                <line x1="32" y1="50" x2="32" y2="42" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                <line x1="14" y1="32" x2="22" y2="32" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="vaultGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-100">VTU VAULT</span>
          </div>

          <div className="hidden items-center gap-2.5 lg:flex">
            <div className="live-dot" />
            <span className="text-xs text-slate-600">Live · Always free</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-400"
              style={{ background: 'rgba(99,102,241,0.09)', border: '1px solid rgba(99,102,241,0.18)' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              VTU 2024
            </div>
          </div>
        </header>

        {/* Content - Optimized for Mobile */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 pb-24 sm:px-5 sm:py-5 md:px-8 md:py-6 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="glass-shell gradient-border rounded-2xl sm:rounded-3xl"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.07)' }}
              >
                <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                  <Outlet />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Navigation - Enhanced */}
        <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around px-3 py-3 lg:hidden"
          style={{ 
            background: 'rgba(2,6,23,0.98)', 
            backdropFilter: 'blur(20px)', 
            borderTop: '1px solid rgba(99,102,241,0.15)',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.3)'
          }}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  isActive ? 'text-indigo-300 scale-105' : 'text-slate-500 active:scale-95'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'rgba(99,102,241,0.2)',
                boxShadow: '0 0 15px rgba(99,102,241,0.4)'
              } : {}}>
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
