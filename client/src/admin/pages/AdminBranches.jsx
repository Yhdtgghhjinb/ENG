import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../useAdmin';
import AdminTable from '../components/AdminTable';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import FormField, { Input } from '../components/FormField';

const EMPTY = { name: '', code: '' };

const AdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [confirm, setConfirm]   = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.get('/branches').then(r => setBranches(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd  = () => { setForm(EMPTY); setModal(true); };
  const openEdit = (row) => { setForm({ ...row }); setModal(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form._id) {
        await adminApi.put(`/branches/${form._id}`, form);
        toast.success('Branch updated');
      } else {
        await adminApi.post('/branches', form);
        toast.success('Branch created');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving branch');
    } finally { setSaving(false); }
  };

  const confirmDelete = (row) => setConfirm(row);

  const doDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/branches/${confirm._id}`);
      toast.success('Branch deleted');
      setConfirm(null);
      load();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code', render: v => <span className="font-mono text-primary-300">{v}</span> },
    { key: 'createdAt', label: 'Created', render: v => new Date(v).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader
        title="Branches"
        subtitle={`${branches.length} branches configured`}
        action={
          <button onClick={openAdd} className="btn-primary text-sm">+ Add Branch</button>
        }
      />

      <AdminTable columns={columns} data={branches} loading={loading} onEdit={openEdit} onDelete={confirmDelete} />

      {/* Add/Edit Modal */}
      <AdminModal open={modal} title={form._id ? 'Edit Branch' : 'Add Branch'} onClose={() => setModal(false)}>
        <form onSubmit={save} className="space-y-5">
          <FormField label="Branch Name" required>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Computer Science Engineering" required />
          </FormField>
          <FormField label="Branch Code" required>
            <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. CSE" required />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : form._id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog open={!!confirm} message={`Delete branch "${confirm?.name}"? This cannot be undone.`}
        onConfirm={doDelete} onCancel={() => setConfirm(null)} loading={deleting} />
    </div>
  );
};

export default AdminBranches;
