import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
      style={{ 
        background: '#020617',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
      <div className="bg-scene" />
      
      <div className="relative max-w-5xl w-full space-y-8 sm:space-y-12">
        {/* Logo & Title */}
        <div className="text-center space-y-4 sm:space-y-6">
          {/* Custom Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 10px 40px rgba(99,102,241,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
            }}>
            {/* Inner glow effect */}
            <div className="absolute inset-0" 
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 60%)',
              }} />
            {/* Logo Icon - Book with graduation cap concept */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none" className="sm:w-16 sm:h-16">
                {/* Book pages */}
                <path d="M16 20 L16 48 L48 48 L48 20 Z" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.95)" strokeWidth="2"/>
                <path d="M16 20 L32 16 L48 20" fill="rgba(255,255,255,0.7)" stroke="rgba(255,255,255,0.85)" strokeWidth="2"/>
                {/* Bookmark */}
                <path d="M28 20 L28 42 L32 38 L36 42 L36 20 Z" fill="#6366f1" stroke="#6366f1" strokeWidth="1.5"/>
                {/* Star - excellence symbol */}
                <circle cx="44" cy="28" r="8" fill="#fbbf24" stroke="#ffffff" strokeWidth="2"/>
                <path d="M44 24 L45 27 L48 27 L45.5 29 L46.5 32 L44 30 L41.5 32 L42.5 29 L40 27 L43 27 Z" fill="#ffffff"/>
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight px-4">
            StudyHub VTU
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-400 max-w-2xl mx-auto px-4">
            Your complete study companion for VTU engineering courses
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto px-2">
          <div className="p-5 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(79,70,229,0.2) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
            <div className="text-3xl sm:text-4xl mb-3">📖</div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Notes & Materials</h3>
            <p className="text-xs sm:text-sm text-slate-400">Module-wise notes for all subjects</p>
          </div>
          
          <div className="p-5 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(14,165,233,0.4) 0%, rgba(2,132,199,0.2) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
            <div className="text-3xl sm:text-4xl mb-3">📝</div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Question Papers</h3>
            <p className="text-xs sm:text-sm text-slate-400">PYQs and model papers for exam prep</p>
          </div>
          
          <div className="p-5 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(16,185,129,0.4) 0%, rgba(5,150,105,0.2) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
            <div className="text-3xl sm:text-4xl mb-3">🔬</div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Lab Programs</h3>
            <p className="text-xs sm:text-sm text-slate-400">Complete lab manuals and experiments</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center space-y-4">
          <Link
            to="/home"
            className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold text-white transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            }}
          >
            Get Started
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
          <p className="text-xs sm:text-sm text-slate-500">No sign-up required · Free forever</p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 pt-6 sm:pt-8 border-t mx-4" 
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-white">8+</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Branches</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-white">100+</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Subjects</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-white">1000+</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Resources</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
