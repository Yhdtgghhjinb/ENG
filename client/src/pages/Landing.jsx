import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Logo from '../components/Logo';

const Landing = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#020617' }}>
      {/* Dynamic gradient background that follows mouse */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          animate={{
            x: mousePosition.x - 400,
            y: mousePosition.y - 400,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          animate={{
            x: mousePosition.x - 300,
            y: mousePosition.y - 300,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.1 }}
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Animated grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
      </div>

      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
            style={{
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(99,102,241,0.3), transparent)'
                : 'radial-gradient(circle, rgba(236,72,153,0.3), transparent)',
              filter: 'blur(40px)',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Welcome Animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8 sm:space-y-10 md:space-y-12">
            
            {/* Logo with animation - Mobile optimized */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 1, delay: 0.2 }}
              className="flex justify-center pt-2">
              <div className="relative scale-75 sm:scale-90 md:scale-100">
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 40px 15px rgba(99,102,241,0.3)',
                      '0 0 60px 25px rgba(139,92,246,0.4)',
                      '0 0 40px 15px rgba(236,72,153,0.3)',
                      '0 0 40px 15px rgba(99,102,241,0.3)',
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 rounded-full blur-xl sm:blur-2xl"
                />
                <div className="relative">
                  <Logo size="xl" animated={true} showText={false} />
                </div>
              </div>
            </motion.div>

            {/* Welcome Text - Mobile optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-4 sm:space-y-5 md:space-y-6 px-2">
              
              <div className="space-y-2 sm:space-y-3">
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black leading-tight px-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}>
                  <span className="inline-block bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Welcome to
                  </span>
                </motion.h1>
                
                <motion.h2
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black leading-tight px-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}>
                  <span className="inline-block bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                    VTU VAULT
                  </span>
                </motion.h2>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed px-3 sm:px-4">
                Your ultimate engineering resource hub. Access 
                <span className="text-white font-bold"> 1000+ premium materials</span>, 
                question papers, notes & lab programs—
                <span className="text-indigo-400 font-bold"> completely free</span>, forever.
              </motion.p>
            </motion.div>

            {/* Circular Button with Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
              className="flex justify-center">
              
              <Link to="/home" className="group relative">
                {/* Outer rotating ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4">
                  <div className="w-full h-full rounded-full"
                    style={{
                      background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #ec4899, #6366f1)',
                      opacity: 0.6,
                      filter: 'blur(8px)',
                    }}
                  />
                </motion.div>

                {/* Middle pulsing glow */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-3 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(99,102,241,0.4), transparent)',
                    filter: 'blur(20px)',
                  }}
                />

                {/* Main button - Touch optimized */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-40 h-40 xs:w-44 xs:h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-full overflow-hidden cursor-pointer touch-manipulation"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                    boxShadow: '0 20px 50px rgba(99,102,241,0.5), inset 0 2px 10px rgba(255,255,255,0.3)',
                  }}>
                  
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                    }}
                  />

                  {/* Particles inside button */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      animate={{
                        x: [Math.random() * 200 - 100, Math.random() * 200 - 100],
                        y: [Math.random() * 200 - 100, Math.random() * 200 - 100],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                      }}
                    />
                  ))}

                  {/* Content - Mobile optimized */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-center gap-2 sm:gap-3">
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="scale-75 sm:scale-90 md:scale-100">
                      <Logo size="lg" animated={false} showText={false} />
                    </motion.div>
                    
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-center px-2">
                      <div className="text-white font-black text-lg xs:text-xl sm:text-2xl tracking-wider drop-shadow-lg">
                        ENTER
                      </div>
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-white/80 text-[11px] xs:text-xs sm:text-sm font-bold mt-0.5 sm:mt-1">
                        Tap to Start →
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Border highlight */}
                  <div className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
                    }}
                  />
                </motion.div>

                {/* Hover ring effect */}
                <motion.div
                  className="absolute -inset-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  style={{
                    background: 'conic-gradient(from 0deg, transparent, #6366f1, transparent, #ec4899, transparent)',
                    filter: 'blur(15px)',
                  }}
                />
              </Link>
            </motion.div>

            {/* Features grid - Mobile optimized */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto px-3 sm:px-4">
              
              {[
                { icon: '📚', title: 'Study Materials', count: '1000+' },
                { icon: '📝', title: 'Question Papers', count: '500+' },
                { icon: '🤖', title: 'AI Assistant', count: '24/7' },
                { icon: '⚡', title: 'Fast Access', count: 'Instant' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + i * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-center group cursor-pointer touch-manipulation"
                  style={{
                    background: 'rgba(15,23,42,0.6)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    backdropFilter: 'blur(20px)',
                  }}>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    className="text-2xl sm:text-3xl md:text-4xl mb-1.5 sm:mb-2">
                    {item.icon}
                  </motion.div>
                  <div className="text-[11px] xs:text-xs sm:text-sm font-bold text-white mb-0.5 sm:mb-1 leading-tight">
                    {item.title}
                  </div>
                  <div className="text-[10px] xs:text-xs text-indigo-400 font-semibold">
                    {item.count}
                  </div>
                  
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(99,102,241,0.1), transparent)',
                      filter: 'blur(10px)',
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Trust badges - Mobile optimized */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4">
              {[
                { icon: '🔒', text: 'Secure' },
                { icon: '🆓', text: 'Free Forever' },
                { icon: '⚡', text: 'Fast' },
                { icon: '📱', text: 'Mobile Ready' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.9 + i * 0.05 }}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full"
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)',
                  }}>
                  <span className="text-sm sm:text-base md:text-lg">{item.icon}</span>
                  <span className="text-[10px] xs:text-xs sm:text-sm text-slate-400 font-medium whitespace-nowrap">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Live indicator - Mobile optimized */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 px-3">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500"></span>
              </motion.div>
              <span className="font-medium text-center">System Online • Ready to Use</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* CSS for grid animation */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
