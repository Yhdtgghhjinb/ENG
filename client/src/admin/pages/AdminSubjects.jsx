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
  name: '', code: '', branchId: '', schemeId: '', semesterId: '',
  credits: '', lectureHours: '', tutorialHours: '', practicalHours: '', totalHours: '',
  syllabus: '', courseObjectives: '', courseOutcomes: '', referenceBooks: '', courseHandoutUrl: '',
  youtubeVideos: '',
};
const LIMIT = 20;

const AdminSubjects = () => {
  const [data, setData]         = useState({ subjects: [], total: 0, pages: 1 });
  const [branches, setBranches] = useState([]);
  const [schemes, setSchemes]   = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [confirm, setConfirm]   = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.get('/subjects', { params: { q: search, page, limit: LIMIT } })
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(load, [load]);

  useEffect(() => {
    Promise.all([adminApi.get('/branches'), adminApi.get('/schemes'), adminApi.get('/semesters')])
      .then(([b, sc, sem]) => { setBranches(b.data); setSchemes(sc.data); setSemesters(sem.data); });
  }, []);

  const filteredSchemes   = schemes.filter(s => !form.branchId || (s.branchId?._id || s.branchId) === form.branchId);
  const filteredSemesters = semesters.filter(s => !form.schemeId || (s.schemeId?._id || s.schemeId) === form.schemeId);

  const openAdd  = () => { setForm(EMPTY); setModal(true); };
  const openEdit = (row) => {
    setForm({
      ...row,
      branchId:   row.branchId?._id   || row.branchId,
      schemeId:   row.schemeId?._id   || row.schemeId,
      semesterId: row.semesterId?._id  || row.semesterId,
      credits:        row.credits        ?? '',
      lectureHours:   row.lectureHours   ?? '',
      tutorialHours:  row.tutorialHours  ?? '',
      practicalHours: row.practicalHours ?? '',
      totalHours:     row.totalHours     ?? '',
      syllabus:          row.syllabus          || '',
      courseObjectives:  (row.courseObjectives  || []).join('\n'),
      courseOutcomes:    (row.courseOutcomes    || []).join('\n'),
      referenceBooks:    (row.referenceBooks    || []).join('\n'),
      courseHandoutUrl:  row.courseHandoutUrl   || '',
      youtubeVideos: (row.youtubeVideos || []).map(v => `${v.title}|${v.videoId}|${v.module || ''}|${v.description || ''}`).join('\n'),
    });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Parse newline-separated fields into arrays
      const payload = {
        ...form,
        courseObjectives: form.courseObjectives ? form.courseObjectives.split('\n').map(s => s.trim()).filter(Boolean) : [],
        courseOutcomes:   form.courseOutcomes   ? form.courseOutcomes.split('\n').map(s => s.trim()).filter(Boolean)   : [],
        referenceBooks:   form.referenceBooks   ? form.referenceBooks.split('\n').map(s => s.trim()).filter(Boolean)   : [],
        youtubeVideos: form.youtubeVideos ? form.youtubeVideos.split('\n').map(line => {
          const [title, videoId, module, description] = line.split('|').map(s => s.trim());
          return { title, videoId, module: module || '', description: description || '' };
        }).filter(v => v.title && v.videoId) : [],
        credits:        form.credits        !== '' ? Number(form.credits)        : null,
        lectureHours:   form.lectureHours   !== '' ? Number(form.lectureHours)   : null,
        tutorialHours:  form.tutorialHours  !== '' ? Number(form.tutorialHours)  : null,
        practicalHours: form.practicalHours !== '' ? Number(form.practicalHours) : null,
        totalHours:     form.totalHours     !== '' ? Number(form.totalHours)     : null,
      };
      if (form._id) {
        await adminApi.put(`/subjects/${form._id}`, payload);
        toast.success('Subject updated');
      } else {
        await adminApi.post('/subjects', payload);
        toast.success('Subject created');
      }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/subjects/${confirm._id}`);
      toast.success('Subject deleted');
      setConfirm(null); load();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: 'name', label: 'Subject Name' },
    { key: 'code', label: 'Code', render: v => <span className="font-mono text-xs text-primary-300">{v}</span> },
    { key: 'branchId',   label: 'Branch',   render: v => v?.code || '—' },
    { key: 'schemeId',   label: 'Scheme',   render: v => v?.label || '—' },
    { key: 'semesterId', label: 'Sem',      render: v => v?.number ? `Sem ${v.number}` : '—' },
  ];

  return (
    <div>
      <PageHeader title="Subjects" subtitle={`${data.total} subjects total`}
        action={<button onClick={openAdd} className="btn-primary text-sm">+ Add Subject</button>} />

      {/* Search */}
      <div className="mb-5 relative w-full max-w-sm">
        <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search subjects…" className="input-premium pl-10 text-sm" />
      </div>

      <AdminTable columns={columns} data={data.subjects} loading={loading} onEdit={openEdit} onDelete={setConfirm} />
      <Pagination page={page} pages={data.pages} total={data.total} limit={LIMIT} onPage={setPage} />

      <AdminModal open={modal} title={form._id ? 'Edit Subject' : 'Add Subject'} onClose={() => setModal(false)} size="lg">
        <form onSubmit={save} className="space-y-5">
          {/* ── Basic info ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Subject Name" required>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Data Structures" required />
            </FormField>
            <FormField label="Subject Code" required>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. 21CS41" required />
            </FormField>
          </div>
          <FormField label="Branch" required>
            <Select value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value, schemeId: '', semesterId: '' }))} required>
              <option value="">Select branch…</option>
              {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Scheme" required>
            <Select value={form.schemeId} onChange={e => setForm(f => ({ ...f, schemeId: e.target.value, semesterId: '' }))} required disabled={!form.branchId}>
              <option value="">Select scheme…</option>
              {filteredSchemes.map(s => <option key={s._id} value={s._id}>{s.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Semester" required>
            <Select value={form.semesterId} onChange={e => setForm(f => ({ ...f, semesterId: e.target.value }))} required disabled={!form.schemeId}>
              <option value="">Select semester…</option>
              {filteredSemesters.map(s => <option key={s._id} value={s._id}>Semester {s.number}</option>)}
            </Select>
          </FormField>

          {/* ── Academic metadata ──────────────────────────────────────── */}
          <div className="rounded-2xl p-4 space-y-4" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary-400">Academic Metadata (Optional)</p>

            <div className="grid grid-cols-5 gap-3">
              {[
                { key: 'credits',        label: 'Credits' },
                { key: 'lectureHours',   label: 'Lecture Hrs' },
                { key: 'tutorialHours',  label: 'Tutorial Hrs' },
                { key: 'practicalHours', label: 'Practical Hrs' },
                { key: 'totalHours',     label: 'Total Hrs' },
              ].map(({ key, label }) => (
                <FormField key={key} label={label}>
                  <Input
                    type="number" min="0"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder="0"
                  />
                </FormField>
              ))}
            </div>

            <FormField label="Course Handout URL" hint="PDF link to the official course handout">
              <Input
                value={form.courseHandoutUrl}
                onChange={e => setForm(f => ({ ...f, courseHandoutUrl: e.target.value }))}
                placeholder="https://…"
              />
            </FormField>

            <FormField label="Course Objectives" hint="One per line">
              <Textarea
                value={form.courseObjectives}
                onChange={e => setForm(f => ({ ...f, courseObjectives: e.target.value }))}
                placeholder={"Understand OS concepts\nApply scheduling algorithms"}
                rows={3}
              />
            </FormField>

            <FormField label="Course Outcomes" hint="One per line">
              <Textarea
                value={form.courseOutcomes}
                onChange={e => setForm(f => ({ ...f, courseOutcomes: e.target.value }))}
                placeholder={"Students will be able to explain process management\nDesign memory allocation strategies"}
                rows={3}
              />
            </FormField>

            <FormField label="Reference Books" hint="One per line">
              <Textarea
                value={form.referenceBooks}
                onChange={e => setForm(f => ({ ...f, referenceBooks: e.target.value }))}
                placeholder={"Operating System Concepts — Silberschatz\nModern Operating Systems — Tanenbaum"}
                rows={3}
              />
            </FormField>

            <FormField label="Syllabus" hint="Markdown supported">
              <Textarea
                value={form.syllabus}
                onChange={e => setForm(f => ({ ...f, syllabus: e.target.value }))}
                placeholder="Module 1: Introduction to OS..."
                rows={4}
              />
            </FormField>

            <FormField label="YouTube Videos" hint="Format: Title | Video ID | Module | Description (one per line)">
              <Textarea
                value={form.youtubeVideos}
                onChange={e => setForm(f => ({ ...f, youtubeVideos: e.target.value }))}
                placeholder="Introduction to Operating Systems | dQw4w9WgXcQ | 1 | Basic OS concepts&#10;Process Management | abc123xyz | 2 | Learn about processes"
                rows={4}
              />
              <div className="mt-2 text-[10px] text-slate-500 space-y-1">
                <p>📝 <strong>Format per line:</strong> Title | VideoID | Module | Description</p>
                <p>🎥 <strong>Video ID:</strong> From youtube.com/watch?v=<span className="text-indigo-400">dQw4w9WgXcQ</span> (copy the part after v=)</p>
                <p>💡 <strong>Example:</strong> OS Basics | dQw4w9WgXcQ | 1 | Introduction video</p>
              </div>
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : form._id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog open={!!confirm} message={`Delete subject "${confirm?.name}"?`}
        onConfirm={doDelete} onCancel={() => setConfirm(null)} loading={deleting} />
    </div>
  );
};

export default AdminSubjects;
