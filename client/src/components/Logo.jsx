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
    whileHover: { scale: 1.05 },
    transition: { duration: 0.3, ease: "easeInOut" }
  } : {};

  return (
    <div className="flex items-center gap-3">
      <LogoContainer
        {...logoProps}
        className={`${sizes[size].container} relative flex items-center justify-center`}>
        {/* New VV Logo */}
        <svg 
          className="w-full h-full" 
          viewBox="0 0 100 100" 
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          {/* Top Arc */}
          <path 
            d="M 25 35 Q 50 10, 75 35" 
            stroke="#8B7CFF" 
            strokeWidth="8" 
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Bottom Arc */}
          <path 
            d="M 25 65 Q 50 90, 75 65" 
            stroke="#8B7CFF" 
            strokeWidth="8" 
            fill="none"
            strokeLinecap="round"
          />
          
          {/* White V */}
          <path 
            d="M 20 40 L 35 70 L 45 50" 
            stroke="white" 
            strokeWidth="10" 
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Purple V */}
          <path 
            d="M 55 50 L 65 70 L 80 40" 
            stroke="#A78BFA" 
            strokeWidth="10" 
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
