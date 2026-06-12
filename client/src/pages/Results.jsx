import { motion } from 'framer-motion';

const Results = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-md px-4"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
            border: '2px solid rgba(99,102,241,0.3)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.2)',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </motion.div>

        {/* Title */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Coming Soon
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            VTU Results checker is under development. Stay tuned for live results integration!
          </p>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-6 mt-6"
          style={{
            background: 'rgba(99,102,241,0.05)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <p className="text-sm text-slate-500 leading-relaxed">
            We're working on bringing you direct VTU results integration. 
            Check back soon for updates!
          </p>
        </motion.div>

        {/* Decorative element */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="inline-block text-4xl mt-4"
        >
          🚀
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Results;
