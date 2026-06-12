import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon, accent = '#818cf8', glow, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    className="relative overflow-hidden rounded-xl sm:rounded-2xl p-5 sm:p-6"
    style={{
      background: `linear-gradient(138deg, ${accent}1a 0%, ${accent}08 55%, rgba(4,7,20,0.92) 100%)`,
      border: `1px solid ${accent}30`,
      boxShadow: `0 4px 20px rgba(0,0,0,0.35), 0 0 0 1px ${accent}18`,
    }}
  >
    {/* Subtle glow effect */}
    <div className="pointer-events-none absolute -right-4 sm:-right-6 -top-4 sm:-top-6 h-20 sm:h-28 w-20 sm:w-28 rounded-full"
      style={{ background: `radial-gradient(circle, ${glow || accent}50 0%, transparent 70%)`, filter: 'blur(16px)', opacity: 0.4 }} />
    
    <div className="relative flex flex-col">
      {/* Icon */}
      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl text-2xl sm:text-3xl mb-3 sm:mb-4"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
        {icon}
      </div>
      
      {/* Value */}
      <p className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">{value}</p>
      
      {/* Label */}
      <p className="mt-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: `${accent}cc` }}>
        {label}
      </p>
    </div>
  </motion.div>
);

export default StatCard;
