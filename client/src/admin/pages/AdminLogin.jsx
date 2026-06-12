import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
    if (localStorage.getItem('adminToken') === 'authenticated') {
      navigate('/admin', { replace: true });
    }

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (credentials.username === 'rakeshn' && credentials.password === 'Rakeshn9380@') {
      localStorage.setItem('adminToken', 'authenticated');
      setTimeout(() => navigate('/admin'), 500);
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-3 sm:px-4 py-6" 
      style={{ background: '#020617' }}>
      
      {/* Dynamic gradient background that follows mouse */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          animate={{
            x: mousePosition.x - 300,
            y: mousePosition.y - 300,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          animate={{
            x: mousePosition.x - 200,
            y: mousePosition.y - 200,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.1 }}
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Animated grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'gridMove 15s linear infinite',
          }}
        />
      </div>

      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-48 h-48 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 12 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
            style={{
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(99,102,241,0.4), transparent)'
                : 'radial-gradient(circle, rgba(236,72,153,0.4), transparent)',
              filter: 'blur(30px)',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 sm:space-y-8">

          {/* Logo with advanced animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1, delay: 0.2 }}
            className="flex justify-center">
            <div className="relative">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 40px 15px rgba(99,102,241,0.4)',
                    '0 0 60px 25px rgba(139,92,246,0.5)',
                    '0 0 40px 15px rgba(236,72,153,0.4)',
                    '0 0 40px 15px rgba(99,102,241,0.4)',
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 rounded-full blur-2xl"
              />
              <div className="relative scale-90 sm:scale-100">
                <Logo size="xl" animated={true} showText={false} />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2 px-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-indigo-300 md:text-transparent"
              style={{
                willChange: 'transform, opacity',
                background: 'linear-gradient(to right, #a5b4fc, #c4b5fd, #f9a8d4)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}>
              Admin Access
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              VTU VAULT Management Portal
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8"
            style={{
              background: 'rgba(15,23,42,0.7)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(99,102,241,0.3)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>

            {/* Animated border glow */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl sm:rounded-3xl -z-10"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(99,102,241,0.3)',
                  '0 0 30px rgba(139,92,246,0.4)',
                  '0 0 20px rgba(236,72,153,0.3)',
                  '0 0 20px rgba(99,102,241,0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              {/* Username Field */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-300">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <motion.svg 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </motion.svg>
                  </div>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    placeholder="Enter admin username"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:scale-[1.02]"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(99,102,241,0.3)',
                    }}
                    required
                    autoComplete="username"
                  />
                  {/* Input glow on focus */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10"
                    style={{
                      background: 'rgba(99,102,241,0.1)',
                      filter: 'blur(10px)',
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-300">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <motion.svg 
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </motion.svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="Enter admin password"
                    className="w-full pl-10 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:scale-[1.02]"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(99,102,241,0.3)',
                    }}
                    required
                    autoComplete="current-password"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-slate-400 hover:text-indigo-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    )}
                  </motion.button>
                  {/* Input glow on focus */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10"
                    style={{
                      background: 'rgba(99,102,241,0.1)',
                      filter: 'blur(10px)',
                    }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 sm:p-4 rounded-xl text-xs sm:text-sm text-red-300 flex items-center gap-2"
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.4)',
                  }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit Button - Advanced circular style */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full py-3.5 sm:py-4 rounded-xl font-black text-sm sm:text-base text-white transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                  boxShadow: '0 20px 40px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ x: ['-150%', '150%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transform: 'skewX(-20deg)',
                  }}
                />

                {/* Sparkles */}
                {!loading && [...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                    style={{
                      left: `${10 + i * 12}%`,
                      top: `${30 + (i % 3) * 20}%`,
                    }}
                  />
                ))}

                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <motion.svg 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5" 
                        viewBox="0 0 24 24" 
                        fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </motion.svg>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <motion.svg 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </motion.svg>
                      <span>Access Admin Panel</span>
                      <motion.svg 
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                      </motion.svg>
                    </>
                  )}
                </span>

                {/* Button glow */}
                <div className="absolute inset-0 rounded-xl opacity-50"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
                  }}
                />
              </motion.button>
            </form>

            {/* Back to Home */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-5 sm:mt-6 text-center">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-indigo-300 transition-all duration-300 group">
                <motion.svg 
                  className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </motion.svg>
                <span className="font-medium">Return to Main Site</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-3 sm:gap-4 px-3">
            {[
              { icon: '🔒', text: 'Encrypted' },
              { icon: '🛡️', text: 'Protected' },
              { icon: '⚡', text: 'Secure' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}>
                <span className="text-sm">{item.icon}</span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Live Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </motion.div>
            <span className="font-medium">System Secure • Admin Ready</span>
          </motion.div>
        </motion.div>
      </div>

      {/* CSS for grid animation */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
