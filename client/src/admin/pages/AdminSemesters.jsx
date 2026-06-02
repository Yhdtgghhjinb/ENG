import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../useAdmin';
import AdminTable from '../components/AdminTable';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import FormField, { Select } from '../components/FormField';

const EMPTY = { number: '', branchId: '', schemeId: '' };

const AdminSemesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [branches, setBranches]   = useState([]);
  const [schemes, setSchemes]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [confirm, setConfirm]     = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.get('/semesters'), adminApi.get('/branches'), adminApi.get('/schemes')])
      .then(([sem, br, sc]) => { setSemesters(sem.data); setBranches(br.data); setSchemes(sc.data); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filteredSchemes = schemes.filter(s => !form.branchId || (s.branchId?._id || s.branchId) === form.branchId);

  const openAdd  = () => { setForm(EMPTY); setModal(true); };
  const openEdit = (row) => {
    setForm({ ...row, branchId: row.branchId?._id || row.branchId, schemeId: row.schemeId?._id || row.schemeId });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form._id) {
        await adminApi.put(`/semesters/${form._id}`, form);
        toast.success('Semester updated');
      } else {
        await adminApi.post('/semesters', form);
        toast.success('Semester created');
      }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/semesters/${confirm._id}`);
      toast.success('Semester deleted');
      setConfirm(null); load();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: 'number',   label: 'Semester', render: v => <span className="text-2xl font-black text-primary-300">{v}</span> },
    { key: 'branchId', label: 'Branch',   render: v => v?.name || '—' },
    { key: 'schemeId', label: 'Scheme',   render: v => v?.label || '—' },
    { key: 'createdAt', label: 'Created', render: v => new Date(v).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Semesters" subtitle={`${semesters.length} semesters`}
        action={<button onClick={openAdd} className="btn-primary text-sm">+ Add Semester</button>} />

      <AdminTable columns={columns} data={semesters} loading={loading} onEdit={openEdit} onDelete={setConfirm} />

      <AdminModal open={modal} title={form._id ? 'Edit Semester' : 'Add Semester'} onClose={() => setModal(false)}>
        <form onSubmit={save} className="space-y-5">
          <FormField label="Branch" required>
            <Select value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value, schemeId: '' }))} required>
              <option value="">Select branch…</option>
              {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Scheme" required>
            <Select value={form.schemeId} onChange={e => setForm(f => ({ ...f, schemeId: e.target.value }))} required disabled={!form.branchId}>
              <option value="">Select scheme…</option>
              {filteredSchemes.map(s => <option key={s._id} value={s._id}>{s.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Semester Number" required>
            <Select value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} required>
              <option value="">Select semester…</option>
              {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : form._id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog open={!!confirm} message={`Delete Semester ${confirm?.number}?`}
        onConfirm={doDelete} onCancel={() => setConfirm(null)} loading={deleting} />
    </div>
  );
};

export default AdminSemesters;
