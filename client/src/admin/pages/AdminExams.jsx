import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../useAdmin';
import AdminTable from '../components/AdminTable';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import FormField, { Input, Select, Textarea } from '../components/FormField';

const EMPTY = { title: '', description: '', date: '', semester: '', type: 'other', branch: '', isActive: true };
const LIMIT = 20;

const AdminExams = () => {
  const [data, setData] = useState({ exams: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.get('/exams', { params: { page, limit: LIMIT } })
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(load, [load]);

  const openAdd = () => { setForm(EMPTY); setModal(true); };
  const openEdit = (row) => {
    setForm({
      ...row,
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
    });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form._id) {
        await adminApi.put(`/exams/${form._id}`, form);
        toast.success('Exam updated');
      } else {
        await adminApi.post('/exams', form);
        toast.success('Exam created');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/exams/${confirm._id}`);
      toast.success('Exam deleted');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Exam Calendar" subtitle="Manage VTU exam dates and schedules" onAdd={openAdd} />

      <AdminTable
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'description', label: 'Description', render: v => v?.substring(0, 50) || '-' },
          { key: 'date', label: 'Date', render: v => new Date(v).toLocaleDateString() },
          { key: 'semester', label: 'Semester', render: v => v ? `Sem ${v}` : '-' },
          { key: 'type', label: 'Type' },
          { key: 'isActive', label: 'Status', render: v => v ? '✅ Active' : '❌ Inactive' },
        ]}
        data={data.exams}
        loading={loading}
        onEdit={openEdit}
        onDelete={row => setConfirm(row)}
      />

      <Pagination page={page} pages={data.pages} onChange={setPage} />

      <AdminModal open={modal} onClose={() => setModal(false)} title={form._id ? 'Edit Exam' : 'Add Exam'}>
        <form onSubmit={save} className="space-y-4">
          <FormField label="Exam Title" required>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </FormField>

          <FormField label="Description">
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Exam Date" required>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </FormField>

            <FormField label="Semester">
              <Select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Exam Type">
              <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="practical">Practical</option>
                <option value="viva">Viva</option>
                <option value="assignment">Assignment</option>
                <option value="other">Other</option>
              </Select>
            </FormField>

            <FormField label="Branch (Optional)">
              <Input value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} placeholder="e.g., Computer Science" />
            </FormField>
          </div>

          <FormField label="Status">
            <Select value={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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

      <ConfirmDialog
        open={!!confirm}
        message={`Delete exam "${confirm?.title}"?`}
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
        loading={deleting}
      />
    </div>
  );
};

export default AdminExams;
