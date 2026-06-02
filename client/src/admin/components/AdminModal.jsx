import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

const AdminModal = ({ open, title, onClose, children, size = 'md' }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const widths = { sm: 480, md: 600, lg: 760, xl: 920 };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0"
            style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full overflow-hidden rounded-2xl"
            style={{
              maxWidth: widths[size],
              background: 'linear-gradient(145deg, rgba(10,16,36,0.98), rgba(6,10,24,0.96))',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.08)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <h2 className="text-base font-bold text-slate-100">{title}</h2>
              <button onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:text-slate-200"
                style={{ background: 'rgba(99,102,241,0.08)' }}>
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[75vh] overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdminModal;
