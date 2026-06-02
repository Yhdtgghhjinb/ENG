const FormField = ({ label, error, required, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
      {label}{required && <span className="ml-1 text-red-400">*</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] text-slate-600">{hint}</p>}
    {error && <p className="text-[11px] text-red-400">{error}</p>}
  </div>
);

export const Input = ({ className = '', ...props }) => (
  <input
    className={`input-premium ${className}`}
    {...props}
  />
);

export const Select = ({ children, className = '', ...props }) => (
  <select
    className={`input-premium ${className}`}
    style={{ background: 'rgba(5,9,22,0.9)' }}
    {...props}
  >
    {children}
  </select>
);

export const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`input-premium resize-none ${className}`}
    rows={3}
    {...props}
  />
);

export default FormField;
