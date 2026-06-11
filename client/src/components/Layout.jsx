import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Logo from './Logo';

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
  {
    to: '/home/exam-calendar', end: false, label: 'Exam Calendar', badge: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    to: '/home/notifications', end: false, label: 'Notifications', badge: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    to: '/home/resource-requests', end: false, label: 'Requests', badge: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    to: '/home/ai-assistant', end: false, label: 'AI Assistant', badge: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8"/><rect x="8" y="12" width="8" height="8" rx="1"/><circle cx="20" cy="20" r="2"/>
      </svg>
    ),
  },
  {
    to: '/home/qp-analyzer', end: false, label: 'QP Analyzer', badge: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
];

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Close More menu when route changes
  useEffect(() => {
    setShowMoreMenu(false);
  }, [location.pathname]);

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
        <div className="px-5 pt-7 pb-6">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}>
            <Logo size="md" animated={false} showText={true} />
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
          <div className="flex items-center gap-3 lg:hidden">
            <Logo size="sm" animated={false} showText={false} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">VTU VAULT</span>
              <span className="text-[9px] text-slate-500 leading-tight">Engineering Resources</span>
            </div>
          </div>

          <div className="hidden items-center gap-2.5 lg:flex">
            <div className="live-dot" />
            <span className="text-xs text-slate-600">Live · Always free</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-400"
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
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 pb-28 sm:px-5 sm:py-5 sm:pb-32 md:px-8 md:py-6 lg:pb-8">
          <div className="mx-auto max-w-7xl pb-4">
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

        {/* Mobile Bottom Navigation - Optimized with 5 items max */}
        <nav className="fixed inset-x-0 bottom-0 z-50 lg:hidden safe-area-inset-bottom"
          style={{ 
            background: 'rgba(2,6,23,0.98)', 
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderTop: '1px solid rgba(99,102,241,0.15)',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.4)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}>
          <div className="flex items-center justify-around px-2 py-2">
            {/* Show only first 5 navigation items on mobile */}
            {NAV_ITEMS.slice(0, 5).map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 min-w-0 ${
                    isActive ? 'text-indigo-300 scale-105' : 'text-slate-500 active:scale-95'
                  }`
                }
                style={({ isActive }) => isActive ? {
                  background: 'rgba(99,102,241,0.2)',
                  boxShadow: '0 0 15px rgba(99,102,241,0.4)'
                } : {}}>
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <span className="text-[9px] leading-tight text-center truncate max-w-[60px]">
                  {item.label === 'Notifications' ? 'Alerts' : 
                   item.label === 'Calculator' ? 'Calc' : 
                   item.label}
                </span>
              </NavLink>
            ))}
            
            {/* More Menu Button */}
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 min-w-0 ${
                showMoreMenu ? 'text-indigo-300 scale-105 bg-indigo-500/20' : 'text-slate-500 active:scale-95'
              }`}>
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </div>
              <span className="text-[9px] leading-tight text-center">More</span>
            </button>
          </div>
          
          {/* More Menu Popup */}
          <AnimatePresence>
            {showMoreMenu && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/20" 
                  onClick={() => setShowMoreMenu(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full right-4 mb-2 w-48 rounded-2xl overflow-hidden z-50"
                  style={{
                    background: 'rgba(10,16,36,0.98)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  }}>
                  {NAV_ITEMS.slice(5).map((item) => {
                    const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setShowMoreMenu(false)}
                        className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 border-b border-white/5 last:border-0 ${
                          isActive ? 'text-indigo-300 bg-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10'
                        }`}>
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {item.icon}
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
