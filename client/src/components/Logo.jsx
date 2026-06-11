import { motion } from 'framer-motion';

const Logo = ({ size = 'md', showText = true, animated = true }) => {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-sm', subtitle: 'text-[8px]' },
    md: { container: 'w-10 h-10', text: 'text-base', subtitle: 'text-[10px]' },
    lg: { container: 'w-12 h-12', text: 'text-lg', subtitle: 'text-xs' },
    xl: { container: 'w-16 h-16', text: 'text-xl', subtitle: 'text-sm' },
  };

  const LogoContainer = animated ? motion.div : 'div';
  const logoProps = animated ? {
    whileHover: { rotate: 360, scale: 1.05 },
    transition: { duration: 0.6, ease: "easeInOut" }
  } : {};

  return (
    <div className="flex items-center gap-3">
      <LogoContainer
        {...logoProps}
        className={`${sizes[size].container} rounded-xl relative flex items-center justify-center overflow-hidden`}
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)',
          border: '2px solid #64748b',
        }}>
        {/* Vault Door Design */}
        <svg 
          className="w-full h-full p-1.5" 
          viewBox="0 0 64 64" 
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          {/* Outer Circle */}
          <circle 
            cx="32" 
            cy="32" 
            r="24" 
            stroke="#94a3b8" 
            strokeWidth="2" 
            fill="none"
          />
          {/* Inner Circle */}
          <circle 
            cx="32" 
            cy="32" 
            r="18" 
            stroke="#64748b" 
            strokeWidth="1.5" 
            fill="none"
          />
          {/* Center Knob with Gradient */}
          <circle 
            cx="32" 
            cy="32" 
            r="8" 
            fill="url(#vaultGradient)" 
            stroke="#cbd5e1" 
            strokeWidth="1"
          />
          {/* Main Spokes (Cardinal Directions) */}
          <line x1="32" y1="14" x2="32" y2="22" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="50" y1="32" x2="42" y2="32" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="32" y1="50" x2="32" y2="42" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="14" y1="32" x2="22" y2="32" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Diagonal Spokes */}
          <line x1="20" y1="20" x2="26" y2="26" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
          <line x1="44" y1="20" x2="38" y2="26" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
          <line x1="44" y1="44" x2="38" y2="38" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
          <line x1="20" y1="44" x2="26" y2="38" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
          {/* Center 'V' Letter */}
          <text 
            x="32" 
            y="36" 
            textAnchor="middle" 
            fill="#1e293b" 
            fontFamily="system-ui, sans-serif" 
            fontSize="12" 
            fontWeight="900">
            V
          </text>
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="vaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Lock Indicator (Secure Badge) */}
        <div 
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 2px 8px rgba(16,185,129,0.6), 0 0 0 2px #1e293b',
          }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
      </LogoContainer>

      {showText && (
        <div>
          <h1 
            className={`${sizes[size].text} font-black tracking-tight leading-tight`}
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            VTU VAULT
          </h1>
          <p className={`${sizes[size].subtitle} text-slate-500 font-medium leading-tight`}>
            Engineering Resources
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
