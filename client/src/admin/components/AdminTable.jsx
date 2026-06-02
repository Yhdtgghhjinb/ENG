import { motion } from 'framer-motion';

const AdminTable = ({ columns, data, loading, onEdit, onDelete, emptyText = 'No records found' }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(15,23,42,0.7)' }} />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl"
        style={{ background: 'rgba(8,13,26,0.6)', border: '1px solid rgba(99,102,241,0.1)' }}>
        <span className="text-4xl mb-3">📭</span>
        <p className="text-sm text-slate-400">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(99,102,241,0.12)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'rgba(8,13,26,0.9)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <motion.tr key={row._id || i}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="group transition-colors"
              style={{
                background: i % 2 === 0 ? 'rgba(6,10,24,0.8)' : 'rgba(8,13,26,0.6)',
                borderBottom: '1px solid rgba(99,102,241,0.06)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(6,10,24,0.8)' : 'rgba(8,13,26,0.6)'}
            >
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3.5 text-slate-300">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button onClick={() => onEdit(row)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary-300 transition-all hover:bg-primary-500/15"
                        style={{ border: '1px solid rgba(99,102,241,0.25)' }}>
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/15"
                        style={{ border: '1px solid rgba(239,68,68,0.25)' }}>
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
