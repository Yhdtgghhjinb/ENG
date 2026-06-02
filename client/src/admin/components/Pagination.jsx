const Pagination = ({ page, pages, total, limit, onPage }) => {
  if (pages <= 1) return null;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
      <span>Showing {from}–{to} of {total}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1}
          className="rounded-lg px-3 py-1.5 transition-all disabled:opacity-30 hover:text-slate-200"
          style={{ border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)' }}>
          ← Prev
        </button>
        {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
          const p = i + 1;
          return (
            <button key={p} onClick={() => onPage(p)}
              className="h-8 w-8 rounded-lg text-xs font-medium transition-all"
              style={{
                background: p === page ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(99,102,241,0.06)',
                border: `1px solid ${p === page ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.15)'}`,
                color: p === page ? '#fff' : '#94a3b8',
              }}>
              {p}
            </button>
          );
        })}
        <button onClick={() => onPage(page + 1)} disabled={page >= pages}
          className="rounded-lg px-3 py-1.5 transition-all disabled:opacity-30 hover:text-slate-200"
          style={{ border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)' }}>
          Next →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
