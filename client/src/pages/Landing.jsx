import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden" 
      style={{ 
        background: 'linear-gradient(to bottom, #020617 0%, #0f172a 50%, #1e293b 100%)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute w-80 h-80 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <nav className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Vault Logo */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3)',
                  border: '2px solid #475569',
                }}>
                {/* Vault door design */}
                <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none">
                  {/* Outer circle */}
                  <circle cx="32" cy="32" r="24" stroke="#64748b" strokeWidth="2" fill="none"/>
                  {/* Inner circle */}
                  <circle cx="32" cy="32" r="18" stroke="#475569" strokeWidth="1.5" fill="none"/>
                  {/* Center knob */}
                  <circle cx="32" cy="32" r="8" fill="url(#vaultGradient)" stroke="#94a3b8" strokeWidth="1"/>
                  {/* Spokes */}
                  <line x1="32" y1="14" x2="32" y2="22" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="50" y1="32" x2="42" y2="32" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="32" y1="50" x2="32" y2="42" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="14" y1="32" x2="22" y2="32" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                  {/* Diagonal spokes */}
                  <line x1="20" y1="20" x2="26" y2="26" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="44" y1="20" x2="38" y2="26" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="44" y1="44" x2="38" y2="38" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="20" y1="44" x2="26" y2="38" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="vaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Lock indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 2px 8px rgba(16,185,129,0.5), 0 0 0 2px #020617'
                  }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 20px rgba(255,255,255,0.1)'
                  }}>
                  VTU VAULT
                </h1>
                <p className="text-[10px] text-slate-500 font-medium">Secure Knowledge Repository</p>
              </motion.div>
            </div>
            <motion.a
              href="#features"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="hidden sm:block text-sm font-semibold text-slate-400 hover:text-white transition-colors">
              Features
            </motion.a>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center space-y-8 sm:space-y-12 py-12 sm:py-0">
            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  boxShadow: '0 0 20px rgba(99,102,241,0.2)'
                }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-indigo-300">Now Live • 1000+ Resources Available</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight px-4"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                Your Ultimate<br/>
                <span style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  VTU Study Vault
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed px-4">
                Access premium study materials, question papers, notes, and lab programs—all in one secure platform. Built for VTU engineering students.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <Link
                to="/home"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 10px 40px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
                }}>
                Access Vault
                <svg className="transition-transform group-hover:translate-x-1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-300 transition-all duration-300 hover:text-white active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                Explore Features
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              </a>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-8 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Secure Access</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>No Sign-up</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span>24/7 Available</span>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Features Section */}
        <section id="features" className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Everything You Need</h2>
              <p className="text-slate-400 text-sm sm:text-base">Comprehensive resources for your academic success</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  icon: '📚',
                  title: 'Study Materials',
                  description: 'Module-wise notes, textbooks, and reference materials for all subjects',
                  gradient: 'from-indigo-500/20 to-purple-500/20',
                  border: 'border-indigo-500/30'
                },
                {
                  icon: '📝',
                  title: 'Question Papers',
                  description: 'Previous year questions, model papers, and solution keys for exam preparation',
                  gradient: 'from-blue-500/20 to-cyan-500/20',
                  border: 'border-blue-500/30'
                },
                {
                  icon: '🔬',
                  title: 'Lab Programs',
                  description: 'Complete lab manuals, programs, and experiment documentation',
                  gradient: 'from-emerald-500/20 to-teal-500/20',
                  border: 'border-emerald-500/30'
                },
                {
                  icon: '🧮',
                  title: 'SGPA/CGPA Calculator',
                  description: 'Calculate your grades instantly with our smart calculator tool',
                  gradient: 'from-violet-500/20 to-purple-500/20',
                  border: 'border-violet-500/30'
                },
                {
                  icon: '🎯',
                  title: 'Organized by Scheme',
                  description: 'Resources categorized by branch, scheme, and semester for easy navigation',
                  gradient: 'from-pink-500/20 to-rose-500/20',
                  border: 'border-pink-500/30'
                },
                {
                  icon: '⚡',
                  title: 'Fast & Free',
                  description: 'Lightning-fast access with no subscriptions, no ads, no limitations',
                  gradient: 'from-amber-500/20 to-orange-500/20',
                  border: 'border-amber-500/30'
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className={`group p-6 sm:p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${feature.border}`}
                  style={{
                    background: `linear-gradient(135deg, ${feature.gradient})`,
                  }}>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
              border: '1px solid rgba(99,102,241,0.2)',
              backdropFilter: 'blur(20px)'
            }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: '8+', label: 'Engineering Branches' },
                { number: '100+', label: 'Subjects Covered' },
                { number: '1000+', label: 'Study Resources' },
                { number: '24/7', label: 'Always Available' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-2"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-slate-500">
              © 2024 VTU VAULT. Built for VTU students with ❤️
            </p>
            <p className="text-xs text-slate-600 mt-2">Free forever • No sign-up required</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
