const PageHeader = ({ title, subtitle, action }) => (
  <div className="mb-5 sm:mb-7 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
    <div>
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{title}</h1>
      {subtitle && <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0 self-start">{action}</div>}
  </div>
);

export default PageHeader;
