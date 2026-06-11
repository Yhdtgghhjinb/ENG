import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../useAdmin';
import AdminTable from '../components/AdminTable';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import FormField, { Input, Select, Textarea } from '../components/FormField';

const EMPTY = { 
  title: '', 
  message: '', 
  type: 'announcement', 
  category: '', 
  link: '',
  priority: 'medium', 
  isActive: true 
};
const LIMIT = 20;

const AdminNotifications = () => {
  const [data, setData] = useState({ notifications: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.get('/notifications', { params: { page, limit: LIMIT } })
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(load, [load]);

  const openAdd = () => { setForm(EMPTY); setModal(true); };
  const openEdit = (row) => { setForm(row); setModal(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form._id) {
        await adminApi.put(`/notifications/${form._id}`, form);
        toast.success('Notification updated');
      } else {
        await adminApi.post('/notifications', form);
        toast.success('Notification created');
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
      await adminApi.delete(`/notifications/${confirm._id}`);
      toast.success('Notification deleted');
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
      <PageHeader title="Notifications" subtitle="Send announcements to students" onAdd={openAdd} />

      <AdminTable
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'message', label: 'Message', render: v => v?.substring(0, 60) + '...' },
          { key: 'type', label: 'Type', render: v => v || 'announcement' },
          { key: 'category', label: 'Category', render: v => v || '-' },
          { key: 'priority', label: 'Priority' },
          { key: 'isActive', label: 'Status', render: v => v ? '✅ Active' : '❌ Inactive' },
        ]}
        data={data.notifications}
        loading={loading}
        onEdit={openEdit}
        onDelete={row => setConfirm(row)}
      />

      <Pagination page={page} pages={data.pages} onChange={setPage} />

      <AdminModal open={modal} onClose={() => setModal(false)} title={form._id ? 'Edit Notification' : 'Add Notification'}>
        <form onSubmit={save} className="space-y-4">
          <FormField label="Title" required>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </FormField>

          <FormField label="Message" required>
            <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} required />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type">
              <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="exam">Exam</option>
                <option value="resource">Resource</option>
                <option value="announcement">Announcement</option>
                <option value="update">Update</option>
              </Select>
            </FormField>

            <FormField label="Priority">
              <Select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Category (Optional)" hint="e.g., Semester 5, Computer Science">
            <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          </FormField>

          <FormField label="Link (Optional)" hint="URL to redirect when clicked">
            <Input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://..." />
          </FormField>

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
        message={`Delete notification "${confirm?.title}"?`}
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
        loading={deleting}
      />
    </div>
  );
};

export default AdminNotifications;
