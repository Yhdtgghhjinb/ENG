import { Link, useNavigate } from 'react-router-dom';

/**
 * items: [{ label, to? }]
 * Simple breadcrumb navigation with working back button
 * Mobile-optimized with horizontal scrolling (no wrapping)
 */
const Breadcrumbs = ({ items }) => {
  const navigate = useNavigate();
  const lastIdx = items.length - 1;

  return (
    <nav aria-label="breadcrumb" className="mb-6">
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:-translate-x-1"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        {/* Breadcrumb Trail - Horizontal Scrollable (No Wrap) */}
        <div className="relative flex-1 min-w-0">
          {/* Fade gradient overlay at edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#020617] to-transparent z-10 opacity-0 peer-scroll:opacity-100" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#020617] to-transparent z-10 opacity-0 peer-scroll:opacity-100" />
          
          <div 
            className="peer flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs sm:text-sm md:text-base scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {items.map((item, idx) => {
              const isLast = idx === lastIdx;
              return (
                <span key={`crumb-${idx}`} className="inline-flex items-center gap-1.5 flex-shrink-0">
                  {idx > 0 && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-slate-600">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                  {isLast || !item.to ? (
                    <span className="font-semibold text-white max-w-[150px] sm:max-w-[200px] md:max-w-none truncate">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.to}
                      className="text-slate-400 transition-colors hover:text-white max-w-[120px] sm:max-w-[180px] md:max-w-none truncate"
                    >
                      {item.label}
                    </Link>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
