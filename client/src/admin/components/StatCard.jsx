import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon, accent = '#818cf8', glow, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    className="relative overflow-hidden rounded-2xl p-6"
    style={{
      background: `linear-gradient(138deg, ${accent}22 0%, ${accent}0d 55%, rgba(4,7,20,0.95) 100%)`,
      border: `1px solid ${accent}28`,
      boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
    }}
  >
    <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full"
      style={{ background: `radial-gradient(circle, ${glow || accent}55 0%, transparent 70%)`, filter: 'blur(18px)', opacity: 0.5 }} />
    <div className="relative">
      <p className="text-2xl">{icon}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-400">{label}</p>
    </div>
  </motion.div>
);

export default StatCard;
