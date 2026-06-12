import { Link, useNavigate } from 'react-router-dom';

/**
 * items: [{ label, to? }]
 * Bulletproof breadcrumb - arrows included in text nodes
 */
const Breadcrumbs = ({ items }) => {
  const navigate = useNavigate();
  const lastIdx = items.length - 1;

  return (
    <nav aria-label="breadcrumb" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

        {/* Breadcrumb Trail - Single nowrap container */}
        <div style={{ 
          flex: 1, 
          minWidth: 0, 
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        className="scrollbar-hide">
          {items.map((item, idx) => {
            const isLast = idx === lastIdx;
            const Arrow = () => (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 6px', flexShrink: 0, color: '#475569' }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            );

            return (
              <span key={`crumb-${idx}`} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                {idx > 0 && <Arrow />}
                {isLast || !item.to ? (
                  <span style={{ 
                    fontWeight: 600,
                    color: '#fff',
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                  }}>
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.to}
                    style={{ 
                      color: '#94a3b8',
                      maxWidth: '80px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'inline-block',
                      transition: 'color 0.2s',
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
    </nav>
  );
};

export default Breadcrumbs;
