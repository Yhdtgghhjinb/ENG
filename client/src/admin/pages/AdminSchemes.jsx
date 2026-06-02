import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../useAdmin';
import AdminTable from '../components/AdminTable';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import FormField, { Input, Select } from '../components/FormField';

const EMPTY = { year: '', label: '', branchId: '' };

const AdminSchemes = () => {
  const [schemes, setSchemes]   = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [confirm, setConfirm]   = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.get('/schemes'), adminApi.get('/branches')])
      .then(([s, b]) => { setSchemes(s.data); setBranches(b.data); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd  = () => { setForm(EMPTY); setModal(true); };
  const openEdit = (row) => { setForm({ ...row, branchId: row.branchId?._id || row.branchId }); setModal(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form._id) {
        await adminApi.put(`/schemes/${form._id}`, form);
        toast.success('Scheme updated');
      } else {
        await adminApi.post('/schemes', form);
        toast.success('Scheme created');
      }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/schemes/${confirm._id}`);
      toast.success('Scheme deleted');
      setConfirm(null); load();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: 'label', label: 'Label' },
    { key: 'year',  label: 'Year', render: v => <span className="font-mono text-primary-300">{v}</span> },
    { key: 'branchId', label: 'Branch', render: v => v?.name || '—' },
    { key: 'createdAt', label: 'Created', render: v => new Date(v).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Schemes" subtitle={`${schemes.length} schemes`}
        action={<button onClick={openAdd} className="btn-primary text-sm">+ Add Scheme</button>} />

      <AdminTable columns={columns} data={schemes} loading={loading} onEdit={openEdit} onDelete={setConfirm} />

      <AdminModal open={modal} title={form._id ? 'Edit Scheme' : 'Add Scheme'} onClose={() => setModal(false)}>
        <form onSubmit={save} className="space-y-5">
          <FormField label="Branch" required>
            <Select value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))} required>
              <option value="">Select branch…</option>
              {branches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
            </Select>
          </FormField>
          <FormField label="Year" required>
            <Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
              placeholder="e.g. 2021" min={2000} max={2099} required />
          </FormField>
          <FormField label="Label" required>
            <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="e.g. 2021 Scheme" required />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : form._id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog open={!!confirm} message={`Delete scheme "${confirm?.label}"?`}
        onConfirm={doDelete} onCancel={() => setConfirm(null)} loading={deleting} />
    </div>
  );
};

export default AdminSchemes;
