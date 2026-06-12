const FormField = ({ label, error, required, children, hint }) => (
  <div className="space-y-2">
    <label className="block text-xs sm:text-sm font-semibold text-slate-300">
      {label}{required && <span className="ml-1 text-red-400">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed">{hint}</p>}
    {error && <p className="text-[10px] sm:text-[11px] text-red-400 font-medium">{error}</p>}
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
