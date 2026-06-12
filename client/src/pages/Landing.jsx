import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import Logo from '../components/Logo';

const Landing = () => {
  const [scrollY, setScrollY] = useState(0);
  const { scrollYProgress } = useScroll();
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Orbs - Disabled on mobile for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-96 h-96 -top-48 -left-48 bg-indigo-500/20 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-96 h-96 -bottom-48 -right-48 bg-purple-500/20 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-80 h-80 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-pink-500/10 rounded-full blur-3xl" 
        />
      </div>
      
      <div className="relative z-10">
        {/* Simple Header - Logo Left */}
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`sticky top-0 z-50 transition-all duration-300 ${
            scrollY > 50 ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5' : ''
          }`}>
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-start">
              <Link to="/" className="flex items-center gap-3">
                <Logo size="md" animated={true} showText={false} />
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg font-bold text-white leading-tight">VTU VAULT</span>
                  <span className="text-[10px] text-slate-400 leading-tight">Engineering Resources</span>
                </div>
              </Link>
            </div>
          </nav>
        </motion.header>

        {/* Hero Section */}
        <section className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 min-h-[85vh]">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-5 text-center lg:text-left">
                
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-indigo-300">
                    Live Now • 1000+ Resources
                  </span>
                </motion.div>

                {/* Main Heading */}
                <div className="space-y-2">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
                    <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                      Your Complete
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      VTU Resource Hub
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 pt-2">
                    Access <span className="text-white font-semibold">premium study materials</span>, previous year question papers, notes, and lab programs—all in one secure platform. 
                    <span className="text-indigo-400 font-semibold"> 100% Free Forever.</span>
                  </motion.p>
                </div>

                {/* CTA - Advanced Pro Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center lg:justify-start pt-2">
                  <Link
                    to="/home"
                    className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg text-white transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl active:scale-95 overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                      boxShadow: '0 25px 50px -12px rgba(99,102,241,0.6), 0 10px 40px rgba(139,92,246,0.5), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.3)',
                      border: '2px solid rgba(255,255,255,0.2)',
                      transform: 'perspective(1000px) translateZ(0)',
                    }}>
                    
                    {/* Animated gradient background shift */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        backgroundSize: '200% 100%',
                      }}
                    />
                    
                    {/* Shimmer effect 1 */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        x: ['-150%', '150%'],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: 'easeInOut',
                      }}
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        transform: 'skewX(-20deg)',
                        width: '50%',
                      }}
                    />
                    
                    {/* Shimmer effect 2 - delayed */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        x: ['-150%', '150%'],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: 'easeInOut',
                        delay: 0.3,
                      }}
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transform: 'skewX(-20deg)',
                        width: '30%',
                      }}
                    />
                    
                    {/* Particle effects - floating dots */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-70"
                        animate={{
                          y: [0, -30, -60],
                          x: [0, (i % 2 === 0 ? 20 : -20), (i % 2 === 0 ? 40 : -40)],
                          opacity: [0, 0.7, 0],
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: 'easeOut',
                        }}
                        style={{
                          left: `${20 + i * 10}%`,
                          bottom: '20%',
                        }}
                      />
                    ))}
                    
                    {/* Sparkle effect on hover */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}>
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full"
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: 'easeInOut',
                          }}
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                        />
                      ))}
                    </motion.div>
                    
                    {/* 3D depth layers */}
                    <div className="absolute inset-0 rounded-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
                      }}
                    />
                    
                    {/* Border glow pulse */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      animate={{
                        boxShadow: [
                          '0 0 20px 2px rgba(99,102,241,0.6)',
                          '0 0 30px 4px rgba(139,92,246,0.8)',
                          '0 0 20px 2px rgba(236,72,153,0.6)',
                          '0 0 20px 2px rgba(99,102,241,0.6)',
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    
                    {/* Button content with icons */}
                    <motion.div
                      className="relative z-10"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      </svg>
                    </motion.div>
                    
                    <span className="relative z-10 tracking-wide font-extrabold">
                      Get Started Free
                    </span>
                    
                    <motion.div
                      className="relative z-10"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </motion.div>
                    
                    {/* Glow effect on hover - enhanced */}
                    <div className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                        zIndex: -1,
                      }}
                    />
                    
                    {/* Bottom reflection */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-2xl opacity-30"
                      style={{
                        background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.4))',
                      }}
                    />
                  </Link>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  {[
                    { icon: '🔒', text: 'Secure' },
                    { icon: '⚡', text: 'Fast' },
                    { icon: '🆓', text: 'Free Forever' },
                    { icon: '📱', text: 'Mobile Optimized' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right: Visual - Desktop only for performance */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative hidden lg:block">
                <div className="relative">
                  {/* Floating Cards - Reduced animation complexity */}
                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 right-0 w-64 h-40 rounded-2xl p-6"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                      border: '1px solid rgba(99,102,241,0.3)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 20px 60px rgba(99,102,241,0.3)',
                    }}>
                    <div className="text-4xl mb-2">📚</div>
                    <div className="text-sm font-semibold text-white">Study Materials</div>
                    <div className="text-xs text-slate-400 mt-1">1000+ Resources</div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-0 left-0 w-64 h-40 rounded-2xl p-6"
                    style={{
                      background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.2))',
                      border: '1px solid rgba(236,72,153,0.3)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 20px 60px rgba(236,72,153,0.3)',
                    }}>
                    <div className="text-4xl mb-2">🤖</div>
                    <div className="text-sm font-semibold text-white">AI Assistant</div>
                    <div className="text-xs text-slate-400 mt-1">Instant Answers</div>
                  </motion.div>

                  <div
                    className="w-80 h-80 mx-auto rounded-3xl"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                      opacity: 0.1,
                      filter: 'blur(40px)',
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;

