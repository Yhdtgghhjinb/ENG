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
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
        {/* Simple Header - Logo Only */}
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`sticky top-0 z-50 transition-all duration-300 ${
            scrollY > 50 ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5' : ''
          }`}>
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center">
              <Link to="/">
                <Logo size="lg" animated={true} />
              </Link>
            </div>
          </nav>
        </motion.header>

        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-80px)] flex items-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 sm:space-y-8 text-center lg:text-left">
                
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
                <div className="space-y-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
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
                    className="text-base sm:text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Access <span className="text-white font-semibold">premium study materials</span>, previous year question papers, notes, and lab programs—all in one secure platform. 
                    <span className="text-indigo-400 font-semibold"> 100% Free Forever.</span>
                  </motion.p>
                </div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Link
                    to="/home"
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      boxShadow: '0 20px 60px rgba(99,102,241,0.4)',
                    }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    Get Started Free
                    <svg className="transition-transform group-hover:translate-x-1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                  
                  <a
                    href="#features"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    Explore Features
                  </a>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
                  {[
                    { icon: '🔒', text: 'Secure' },
                    { icon: '⚡', text: 'Fast' },
                    { icon: '🆓', text: 'Free Forever' },
                    { icon: '📱', text: 'Mobile Optimized' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right: Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative hidden lg:block">
                <div className="relative">
                  {/* Floating Cards */}
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
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
                    animate={{ y: [0, 20, 0] }}
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

                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
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

