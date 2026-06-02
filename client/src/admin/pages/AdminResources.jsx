import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../useAdmin';
import AdminTable from '../components/AdminTable';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import FormField, { Input, Select, Textarea } from '../components/FormField';

const TYPES = ['notes','pyq','model','textbook','lab','important','assignment','reference','handout','supplementary','question-bank','syllabus','other'];
const LIMIT  = 20;
const EMPTY  = { subjectId: '', title: '', type: 'notes', description: '', fileUrl: '', moduleNumber: '', unitTitle: '' };

const TypeBadge = ({ type }) => {
  const colors = {
    notes: '#818cf8', pyq: '#38bdf8', model: '#34d399',
    supplementary: '#a78bfa', important: '#fb7185', lab: '#fbbf24',
    textbook: '#2dd4bf', 'question-bank': '#e879f9',
    assignment: '#f97316', other: '#94a3b8',
  };
  const c = colors[type] || '#94a3b8';
  return (
    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ background: `${c}18`, color: c, border: `1px solid ${c}35` }}>
      {type}
    </span>
  );
};

const AdminResources = () => {
  const [data, setData]           = useState({ resources: [], total: 0, pages: 1 });
  const [subjects, setSubjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [file, setFile]           = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving]       = useState(false);
  const [confirm, setConfirm]     = useState(null);
  const [deleting, setDeleting]   = useState(false);
  const [resolvedSubject, setResolvedSubject] = useState(null);
  const fileRef = useRef();

  const load = useCallback(() => {
    setLoading(true);
    adminApi.get('/resources', { params: { q: search, type: typeFilter, page, limit: LIMIT } })
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [search, typeFilter, page]);

  useEffect(load, [load]);

  // Load all subjects for the dropdown (limit 200)
  useEffect(() => {
    adminApi.get('/subjects', { params: { limit: 200 } })
      .then(r => setSubjects(r.data.subjects || []));
  }, []);

  // When subject changes, resolve its hierarchy for display
  useEffect(() => {
    if (!form.subjectId) { setResolvedSubject(null); return; }
    const s = subjects.find(s => s._id === form.subjectId);
    setResolvedSubject(s || null);
  }, [form.subjectId, subjects]);

  const openAdd  = () => { setForm(EMPTY); setFile(null); setUploadProgress(0); setModal(true); };
  const openEdit = (row) => {
    setForm({
      _id: row._id,
      subjectId: row.subjectId?._id || row.subjectId || '',
      title: row.title,
      type: row.type,
      description: row.description || '',
      fileUrl: row.fileUrl || '',
      moduleNumber: row.moduleNumber ?? '',
      unitTitle: row.unitTitle || '',
    });
    setFile(null); setUploadProgress(0); setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.subjectId) { toast.error('Please select a subject'); return; }
    // For new uploads a file or URL is required; for edits it's optional (keep existing)
    if (!form._id && !file && !form.fileUrl) { toast.error('Please upload a file or provide a URL'); return; }

    // PDF-only validation for file uploads
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext !== 'pdf') { toast.error('Only PDF files are allowed'); return; }
    }

    setSaving(true); setUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append('subjectId',   form.subjectId);
      fd.append('title',       form.title);
      fd.append('type',        form.type);
      fd.append('description', form.description);
      if (form.moduleNumber !== '') fd.append('moduleNumber', form.moduleNumber);
      if (form.unitTitle)           fd.append('unitTitle',    form.unitTitle);
      if (file) fd.append('file', file);
      else if (form.fileUrl) fd.append('fileUrl', form.fileUrl);

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      };

      if (form._id) {
        await adminApi.put(`/resources/${form._id}`, fd, config);
        toast.success('Resource updated');
      } else {
        await adminApi.post('/resources', fd, config);
        toast.success('Resource uploaded');
      }
      setModal(false); load();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving resource';
      toast.error(msg);
    } finally { setSaving(false); setUploadProgress(0); }
  };

  const doDelete = async () => {
    setDeleting(true);
    try { await adminApi.delete(`/resources/${confirm._id}`); toast.success('Deleted'); setConfirm(null); load(); }
    catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: 'title',       label: 'Title',   render: v => <span className="font-medium text-slate-200 line-clamp-1">{v}</span> },
    { key: 'type',        label: 'Type',    render: v => <TypeBadge type={v} /> },
    { key: 'subjectName', label: 'Subject', render: (v, row) => <span className="text-xs text-slate-400">{v || row.subjectId?.name || '—'}</span> },
    { key: 'branchName',  label: 'Branch',  render: (v, row) => <span className="text-xs text-slate-500">{v || row.branchId?.name || '—'}</span> },
    { key: 'schemeName',  label: 'Scheme',  render: (v, row) => <span className="text-xs text-slate-500">{v || row.schemeId?.label || '—'}</span> },
    { key: 'semesterNumber', label: 'Sem',  render: (v, row) => <span className="text-xs text-slate-500">{v ? `Sem ${v}` : row.semesterId?.number ? `Sem ${row.semesterId.number}` : '—'}</span> },
    { key: 'fileUrl',     label: 'File',    render: v => v ? <a href={v} target="_blank" rel="noreferrer" className="text-xs text-primary-300 hover:underline">View ↗</a> : '—' },
    { key: 'createdAt',   label: 'Added',   render: v => new Date(v).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="Resources" subtitle={`${data.total} resources · Strict hierarchy enforced`}
        action={<button onClick={openAdd} className="btn-primary text-sm">+ Upload Resource</button>} />

      {/* Info banner */}
      <div className="mb-5 rounded-2xl p-4 text-xs text-slate-400"
        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
        <span className="font-semibold text-primary-300">Strict mode:</span> Select a subject — branch, scheme &amp; semester are auto-filled from the subject hierarchy. No manual linking required.
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative w-72">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search resources…" className="input-premium pl-10 text-sm" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="input-premium w-44 text-sm" style={{ background: 'rgba(5,9,22,0.9)' }}>
          <option value="">All types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <AdminTable columns={columns} data={data.resources} loading={loading} onEdit={openEdit} onDelete={setConfirm} />
      <Pagination page={page} pages={data.pages} total={data.total} limit={LIMIT} onPage={setPage} />

      {/* Upload Modal */}
      <AdminModal open={modal} title={form._id ? 'Edit Resource' : 'Upload Resource'} onClose={() => setModal(false)} size="lg">
        <form onSubmit={save} className="space-y-6">

          {/* ── Step 1: Subject ─────────────────────────────────────────── */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-primary-400">
              Step 1 — Select Subject
            </p>
            <FormField label="Subject" required hint="Branch, scheme & semester are auto-resolved from the subject">
              <Select value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))} required>
                <option value="">Choose a subject…</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code}) — {s.branchId?.code || ''} · {s.schemeId?.label || ''} · Sem {s.semesterId?.number || ''}
                  </option>
                ))}
              </Select>
            </FormField>

            {/* Auto-resolved hierarchy preview */}
            {resolvedSubject ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { label: 'Branch',   value: resolvedSubject.branchId?.name,       color: '#818cf8' },
                  { label: 'Scheme',   value: resolvedSubject.schemeId?.label,       color: '#38bdf8' },
                  { label: 'Semester', value: `Sem ${resolvedSubject.semesterId?.number}`, color: '#34d399' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs"
                    style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                    <span style={{ color: `${color}99` }}>{label}:</span>
                    <span className="font-semibold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-slate-600">Select a subject to see auto-resolved hierarchy</p>
            )}
          </div>

          {/* ── Step 2: Resource details ─────────────────────────────────── */}
          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
              Step 2 — Resource Details
            </p>

            <FormField label="Title" required>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Unit 1 Notes — Introduction to OS"
                required
              />
            </FormField>

            <FormField label="Type" required hint="Choose the category this resource belongs to">
              <Select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, moduleNumber: e.target.value !== 'notes' ? '' : f.moduleNumber }))} required>
                <optgroup label="Primary">
                  <option value="notes">&#x1F4D6; Notes — Module-wise lecture notes</option>
                  <option value="pyq">&#x1F4C3; Question Papers — Previous year papers</option>
                  <option value="model">&#x1F4DD; Model Papers — Model question papers</option>
                  <option value="textbook">&#x1F4DA; Textbooks — Reference books</option>
                  <option value="lab">&#x1F9EA; Lab Manuals — Lab programs &amp; manuals</option>
                  <option value="important">&#x2B50; Important Questions — Curated important Qs</option>
                  <option value="assignment">&#x1F4CB; Assignments — Assignments &amp; exercises</option>
                  <option value="reference">&#x1F4CE; Reference Material — Additional references</option>
                  <option value="handout">&#x1F4F0; Course Handout — Official course handout PDF</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="supplementary">Supplementary</option>
                  <option value="question-bank">Question Bank</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="other">Other</option>
                </optgroup>
              </Select>
            </FormField>

            <FormField label="Description" hint="Optional — brief summary of the resource">
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Covers Unit 1 and Unit 2 topics with examples"
              />
            </FormField>

            {/* Module fields — only shown for notes type */}
            {form.type === 'notes' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Module Number" hint="Required for notes (1–5)" required>
                  <Select
                    value={form.moduleNumber}
                    onChange={e => setForm(f => ({ ...f, moduleNumber: e.target.value }))}
                    required
                  >
                    <option value="">Select module…</option>
                    {[1,2,3,4,5].map(n => (
                      <option key={n} value={n}>Module {n}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Unit Title" hint="Optional — e.g. Introduction to OS">
                  <Input
                    value={form.unitTitle}
                    onChange={e => setForm(f => ({ ...f, unitTitle: e.target.value }))}
                    placeholder="e.g. Process Management"
                  />
                </FormField>
              </div>
            )}
          </div>

          {/* ── Step 3: File upload ──────────────────────────────────────── */}
          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
              Step 3 — Upload File
            </p>

            <FormField label="PDF File" hint="PDF only · Max 50 MB · Drag &amp; drop supported">
              <div
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200"
                style={{
                  borderColor: file ? 'rgba(52,211,153,0.6)' : 'rgba(99,102,241,0.25)',
                  background: file ? 'rgba(52,211,153,0.05)' : 'rgba(5,9,22,0.5)',
                }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (!f) return;
                  if (!f.name.toLowerCase().endsWith('.pdf')) { toast.error('Only PDF files allowed'); return; }
                  setFile(f);
                }}
              >
                <input ref={fileRef} type="file" className="hidden" accept=".pdf"
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f && !f.name.toLowerCase().endsWith('.pdf')) { toast.error('Only PDF files allowed'); return; }
                    setFile(f || null);
                  }} />

                {file ? (
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                      style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
                      &#x1F4CE;
                    </div>
                    <p className="text-sm font-semibold text-emerald-400">{file.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="mt-2 text-[11px] text-slate-600 underline hover:text-slate-400">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                      style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      &#x1F4E4;
                    </div>
                    <p className="text-sm font-medium text-slate-300">Drop PDF here or click to browse</p>
                    <p className="mt-1 text-xs text-slate-600">PDF files only · Max 50 MB</p>
                  </div>
                )}
              </div>
            </FormField>

            {/* Upload progress */}
            {saving && uploadProgress > 0 && (
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
                  <span>Uploading…</span>
                  <span className="font-semibold text-primary-300">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(51,65,85,0.5)' }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
                </div>
              </div>
            )}

            {/* URL fallback */}
            {!file && (
              <FormField label="Or paste a file URL" hint="Use if the file is already hosted online">
                <Input
                  value={form.fileUrl}
                  onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))}
                  placeholder="https://drive.google.com/…"
                />
              </FormField>
            )}
          </div>

          {/* ── Actions ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-t pt-5" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
            <p className="text-[11px] text-slate-600">
              {form.subjectId && resolvedSubject
                ? `Will upload to: ${resolvedSubject.name}`
                : 'Select a subject to continue'}
            </p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setModal(false)} className="btn-ghost text-sm">Cancel</button>
              <button type="submit" disabled={saving || !form.subjectId} className="btn-primary text-sm">
                {saving ? `Uploading ${uploadProgress}%…` : form._id ? 'Update Resource' : 'Upload Resource'}
              </button>
            </div>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog open={!!confirm} message={`Delete "${confirm?.title}"? This cannot be undone.`}
        onConfirm={doDelete} onCancel={() => setConfirm(null)} loading={deleting} />
    </div>
  );
};

export default AdminResources;
