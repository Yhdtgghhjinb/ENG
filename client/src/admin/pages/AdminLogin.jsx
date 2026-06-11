import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('adminToken') === 'authenticated') {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Authentication
    if (credentials.username === 'rakeshn' && credentials.password === 'Rakeshn9380@') {
      localStorage.setItem('adminToken', 'authenticated');
      setTimeout(() => {
        navigate('/admin');
      }, 500);
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
      style={{ 
        background: '#020617',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
      <div className="bg-scene" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Logo size="xl" animated={true} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-sm sm:text-base text-slate-400">VTU VAULT</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="Enter username"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg text-sm text-red-300"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 rounded-xl font-bold text-white transition-all duration-200 active:scale-95"
              style={{
                background: loading 
                  ? 'rgba(99,102,241,0.5)' 
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: loading ? 'none' : '0 8px 32px rgba(99,102,241,0.4)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-slate-400 hover:text-indigo-300 transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
