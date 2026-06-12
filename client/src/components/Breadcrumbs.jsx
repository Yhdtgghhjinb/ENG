import { Link, useNavigate } from 'react-router-dom';

/**
 * Breadcrumbs - absolute no-wrap guarantee
 */
const Breadcrumbs = ({ items }) => {
  const navigate = useNavigate();
  const lastIdx = items.length - 1;

  return (
    <nav aria-label="breadcrumb" style={{ marginBottom: '24px', width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        width: '100%',
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '36px',
            width: '36px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        {/* Breadcrumb - SINGLE UNWRAPPABLE LINE */}
        <div style={{ 
          flex: '1 1 0',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'inline-block',
            width: '100%',
            overflowX: 'auto',
            overflowY: 'hidden',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
          className="scrollbar-hide">
            {items.map((item, idx) => {
              const isLast = idx === lastIdx;
              return (
                <span key={idx} style={{ display: 'inline', whiteSpace: 'nowrap' }}>
                  {idx > 0 && (
                    <span style={{ 
                      display: 'inline',
                      margin: '0 6px',
                      color: '#475569',
                    }}>
                      ›
                    </span>
                  )}
                  {isLast || !item.to ? (
                    <span style={{ 
                      fontWeight: 600,
                      color: '#fff',
                      display: 'inline',
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.to}
                      style={{ 
                        color: '#94a3b8',
                        display: 'inline',
                        maxWidth: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textDecoration: 'none',
                      }}
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
