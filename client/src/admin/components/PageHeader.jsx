const PageHeader = ({ title, subtitle, action }) => (
  <div className="mb-7 flex items-start justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export default PageHeader;
