import AdminModal from './AdminModal';

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, loading }) => (
  <AdminModal open={open} title={title || 'Confirm Action'} onClose={onCancel} size="sm">
    <p className="text-sm text-slate-400 leading-relaxed">{message || 'Are you sure? This action cannot be undone.'}</p>
    <div className="mt-6 flex items-center justify-end gap-3">
      <button onClick={onCancel} className="btn-ghost text-sm px-4 py-2">Cancel</button>
      <button onClick={onConfirm} disabled={loading}
        className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}>
        {loading ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  </AdminModal>
);

export default ConfirmDialog;
