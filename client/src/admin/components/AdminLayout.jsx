import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const NAV = [
  { to: '/admin',            end: true, label: 'Dashboard',  icon: '📊' },
  { to: '/admin/branches',              label: 'Branches',   icon: '🏛️' },
  { to: '/admin/schemes',               label: 'Schemes',    icon: '📐' },
  { to: '/admin/semesters',             label: 'Semesters',  icon: '📅' },
  { to: '/admin/subjects',              label: 'Subjects',   icon: '📘' },
  { to: '/admin/resources',             label: 'Resources',  icon: '📄' },
  { to: '/admin/exams',                 label: 'Exams',      icon: '🎯' },
  { to: '/admin/notifications',         label: 'Notifications', icon: '🔔' },
  { to: '/admin/analytics',             label: 'Analytics',  icon: '📈' },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#020617', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="bg-scene" />

      {/* Sidebar - Desktop */}
      <aside
        className="hidden lg:flex flex-shrink-0 flex-col transition-all duration-300"
        style={{
          width: collapsed ? 64 : 240,
          background: 'rgba(3,5,18,0.99)',
          borderRight: '1px solid rgba(99,102,241,0.1)',
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
              boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.1)',
              border: '1.5px solid #475569'
            }}>
            <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="22" stroke="#64748b" strokeWidth="2" fill="none"/>
              <circle cx="32" cy="32" r="16" stroke="#475569" strokeWidth="1.5" fill="none"/>
              <circle cx="32" cy="32" r="7" fill="url(#vaultGradAdmin)" stroke="#94a3b8" strokeWidth="1"/>
              <line x1="32" y1="15" x2="32" y2="23" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="49" y1="32" x2="41" y2="32" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="49" x2="32" y2="41" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="15" y1="32" x2="23" y2="32" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="vaultGradAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {!collapsed && (
            <div>
              <p className="text-[13px] font-bold text-slate-100">Admin Panel</p>
              <p className="text-[10px] text-slate-600">VTU VAULT</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto flex h-6 w-6 items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 transition-colors"
            style={{ background: 'rgba(99,102,241,0.08)' }}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 p-2 pt-3">
          {!collapsed && <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-700">Menu</p>}
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${
                  isActive
                    ? 'text-primary-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div layoutId="admin-nav-pill" className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.13))', border: '1px solid rgba(99,102,241,0.3)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                  )}
                  <span className="relative z-10 text-base">{item.icon}</span>
                  {!collapsed && <span className="relative z-10">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer - Logout Button */}
        {!collapsed && (
          <div className="p-4" style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header - Mobile Optimized */}
        <header className="flex flex-shrink-0 items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5"
          style={{ background: 'rgba(2,6,23,0.95)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
          
          {/* Mobile: Logo + Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:text-white transition-colors"
              style={{ background: 'rgba(99,102,241,0.1)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  border: '1.5px solid #475569'
                }}>
                <svg width="16" height="16" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="22" stroke="#64748b" strokeWidth="2" fill="none"/>
                  <circle cx="32" cy="32" r="7" fill="url(#vaultGradMobileAdmin)"/>
                  <line x1="32" y1="15" x2="32" y2="23" stroke="#64748b" strokeWidth="2"/>
                  <line x1="49" y1="32" x2="41" y2="32" stroke="#64748b" strokeWidth="2"/>
                  <defs>
                    <linearGradient id="vaultGradMobileAdmin">
                      <stop offset="0%" style={{ stopColor: '#6366f1' }} />
                      <stop offset="100%" style={{ stopColor: '#8b5cf6' }} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-100">Admin</span>
            </div>
          </div>

          {/* Desktop: Page Title */}
          <div className="hidden lg:block">
            <p className="text-xs text-slate-600">Admin Dashboard</p>
            <p className="text-sm font-semibold text-slate-200">
              {NAV.find(n => n.to === location.pathname)?.label || 'VTU VAULT'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <NavLink to="/" className="text-xs text-slate-500 hover:text-primary-300 transition-colors">
              ← Back to site
            </NavLink>
            <div className="flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold text-emerald-400"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-64 flex flex-col"
              style={{ background: 'rgba(3,5,18,0.99)', backdropFilter: 'blur(40px)' }}
            >
              <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden"
                    style={{ 
                      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                      border: '1.5px solid #475569'
                    }}>
                    <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="32" r="22" stroke="#64748b" strokeWidth="2" fill="none"/>
                      <circle cx="32" cy="32" r="7" fill="url(#vaultGradMenuMobile)"/>
                      <line x1="32" y1="15" x2="32" y2="23" stroke="#64748b" strokeWidth="2"/>
                      <line x1="49" y1="32" x2="41" y2="32" stroke="#64748b" strokeWidth="2"/>
                      <defs>
                        <linearGradient id="vaultGradMenuMobile">
                          <stop offset="0%" style={{ stopColor: '#6366f1' }} />
                          <stop offset="100%" style={{ stopColor: '#8b5cf6' }} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-100">Admin Panel</p>
                    <p className="text-[10px] text-slate-600">VTU VAULT</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              <nav className="flex flex-1 flex-col gap-0.5 p-2 pt-3">
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-700">Menu</p>
                {NAV.map((item) => (
                  <NavLink 
                    key={item.to} 
                    to={item.to} 
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${
                        isActive ? 'text-primary-300' : 'text-slate-500 hover:text-slate-300'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div 
                            layoutId="mobile-admin-nav-pill" 
                            className="absolute inset-0 rounded-xl"
                            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.13))', border: '1px solid rgba(99,102,241,0.3)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 34 }} 
                          />
                        )}
                        <span className="relative z-10 text-base">{item.icon}</span>
                        <span className="relative z-10">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* Mobile Logout */}
              <div className="p-4" style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 transition-all"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Content - Mobile Optimized */}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6"
          style={{ background: 'transparent' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
