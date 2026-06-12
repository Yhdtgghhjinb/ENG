import { useEffect, useState } from 'react';
import {
  LazyBarChart as BarChart,
  LazyBar as Bar,
  LazyLineChart as LineChart,
  LazyLine as Line,
  LazyPieChart as PieChart,
  LazyPie as Pie,
  LazyXAxis as XAxis,
  LazyYAxis as YAxis,
  LazyTooltip as Tooltip,
  LazyLegend as Legend,
  LazyResponsiveContainer as ResponsiveContainer,
  LazyCartesianGrid as CartesianGrid,
  LazyCell as Cell
} from '../components/LazyCharts';
import { adminApi } from '../useAdmin';
import StatCard from '../components/StatCard';

const COLORS = ['#818cf8','#38bdf8','#34d399','#e879f9','#fb7185','#fbbf24','#a78bfa','#2dd4bf'];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'rgba(8,13,26,0.98)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 12,
    color: '#e2e8f0',
    fontSize: 12,
  },
  cursor: { fill: 'rgba(99,102,241,0.08)' },
};

const TYPE_COLORS = {
  notes: '#818cf8', pyq: '#38bdf8', model: '#34d399',
  supplementary: '#a78bfa', important: '#fb7185', lab: '#fbbf24',
  textbook: '#2dd4bf', other: '#94a3b8',
};

const AdminAnalytics = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('overview'); // 'overview' | 'downloads'

  const load = () => {
    setLoading(true);
    adminApi.get('/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          {[0,1,2].map(i => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(15,23,42,0.7)' }} />)}
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {[0,1,2,3].map(i => <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: 'rgba(15,23,42,0.7)' }} />)}
        </div>
      </div>
    );
  }

  const { counts, byType, byBranch, recentByDay, topSubjects, mostDownloaded, trendingSubjects } = stats || {};
  const pieData = (byType || []).map((d, i) => ({ name: d._id, value: d.count, color: TYPE_COLORS[d._id] || COLORS[i % COLORS.length] }));

  const TABS = [
    { id: 'overview',  label: 'Overview' },
    { id: 'downloads', label: 'Downloads' },
  ];

  return (
    <div className="space-y-8">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500">Platform usage insights and download trends</p>
        </div>
        <button onClick={load}
          className="btn-ghost text-xs px-3 py-2 self-start sm:self-auto">
          ↻ Refresh
        </button>
      </div>

      {/* Stat cards - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <StatCard label="Total Resources" value={counts?.resources ?? 0} icon="📄" accent="#818cf8" delay={0} />
        <StatCard label="Total Downloads" value={counts?.totalDownloads ?? 0} icon="⬇️" accent="#34d399" delay={0.06} />
        <StatCard label="Subjects" value={counts?.subjects ?? 0} icon="📘" accent="#38bdf8" delay={0.12} />
      </div>

      {/* Tab switcher - Mobile Optimized */}
      <div className="flex gap-1 rounded-xl p-1 overflow-x-auto" style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(99,102,241,0.12)', width: 'fit-content', maxWidth: '100%' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
            style={{
              background: tab === t.id ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
              color: tab === t.id ? '#fff' : '#64748b',
              boxShadow: tab === t.id ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
            {/* Pie: by type - Mobile Optimized */}
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <p className="mb-3 sm:mb-5 text-xs sm:text-sm font-semibold text-slate-200">Resource Distribution by Type</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE.contentStyle} />
                  <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar: by branch - Mobile Optimized */}
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <p className="mb-3 sm:mb-5 text-xs sm:text-sm font-semibold text-slate-200">Resources per Branch</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={(byBranch || []).map(d => ({ name: d._id, count: d.count }))} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="count" radius={[6,6,0,0]}>
                    {(byBranch || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Upload trend - Mobile Optimized */}
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 xl:col-span-2" style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <p className="mb-3 sm:mb-5 text-xs sm:text-sm font-semibold text-slate-200">Upload Activity — Last 30 Days</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={(recentByDay || []).map(d => ({ date: d._id.slice(5), count: d.count }))} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="count" radius={[4,4,0,0]} fill="url(#trendGrad)" />
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top subjects by resource count - Mobile Optimized */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <p className="mb-3 sm:mb-5 text-xs sm:text-sm font-semibold text-slate-200">Top Subjects by Resource Count</p>
            <div className="space-y-2 sm:space-y-3">
              {(topSubjects || []).map((s, i) => {
                const max = topSubjects[0]?.count || 1;
                const pct = Math.round((s.count / max) * 100);
                const color = COLORS[i % COLORS.length];
                return (
                  <div key={s._id} className="flex items-center gap-2 sm:gap-4">
                    <span className="w-5 sm:w-6 text-center text-[10px] sm:text-xs font-bold text-slate-600">{i + 1}</span>
                    <span className="flex-1 min-w-0 truncate text-[11px] sm:text-sm text-slate-300">{s._id || '—'}</span>
                    <div className="flex-1 h-1.5 sm:h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                    </div>
                    <span className="w-7 sm:w-10 text-right text-[10px] sm:text-xs font-semibold flex-shrink-0" style={{ color }}>{s.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── DOWNLOADS TAB ─────────────────────────────────────────────────── */}
      {tab === 'downloads' && (
        <div className="space-y-4 sm:space-y-5">

          {/* Most downloaded resources - Mobile Optimized */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <div className="mb-3 sm:mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p class Name="text-xs sm:text-sm font-semibold text-slate-200">Most Downloaded Resources</p>
              <span className="badge text-[10px] sm:text-xs self-start">Top 10</span>
            </div>

            {!mostDownloaded?.length ? (
              <div className="py-8 sm:py-10 text-center text-xs sm:text-sm text-slate-600">
                No downloads recorded yet. Downloads are tracked when users click the Save button.
              </div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {mostDownloaded.map((r, i) => {
                  const max = mostDownloaded[0]?.downloadCount || 1;
                  const pct = Math.round((r.downloadCount / max) * 100);
                  const color = TYPE_COLORS[r.type] || '#818cf8';
                  return (
                    <div key={r._id} className="flex items-center gap-2 sm:gap-4 rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 transition-colors hover:bg-white/5">
                      <span className="w-4 sm:w-6 text-center text-[10px] sm:text-xs font-black flex-shrink-0" style={{ color }}>{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] sm:text-sm font-semibold text-slate-200">{r.title}</p>
                        <p className="truncate text-[9px] sm:text-[11px] text-slate-600">{r.subjectName} · {r.branchName}</p>
                      </div>
                      <span className="hidden sm:flex flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                        {r.type}
                      </span>
                      <div className="hidden sm:block w-20 sm:w-24 h-1.5 sm:h-2 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'rgba(99,102,241,0.1)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                      </div>
                      <span className="w-8 sm:w-12 text-right text-[10px] sm:text-sm font-black flex-shrink-0" style={{ color }}>
                        {r.downloadCount}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trending subjects by downloads - Mobile Optimized */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <div className="mb-3 sm:mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs sm:text-sm font-semibold text-slate-200">Trending Subjects by Downloads</p>
              <span className="badge text-[10px] sm:text-xs self-start">Top 8</span>
            </div>

            {!trendingSubjects?.length ? (
              <div className="py-8 sm:py-10 text-center text-xs sm:text-sm text-slate-600">
                No download data yet.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trendingSubjects.map(s => ({ name: s._id || '—', downloads: s.totalDownloads, resources: s.resourceCount }))} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="downloads" name="Downloads" radius={[6,6,0,0]} fill="url(#dlGrad)" />
                    <defs>
                      <linearGradient id="dlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>

                {/* Leaderboard - Mobile Optimized */}
                <div className="mt-4 sm:mt-5 space-y-2 sm:space-y-2.5">
                  {trendingSubjects.map((s, i) => {
                    const max = trendingSubjects[0]?.totalDownloads || 1;
                    const pct = Math.round((s.totalDownloads / max) * 100);
                    return (
                      <div key={s._id} className="flex items-center gap-2 sm:gap-4">
                        <span className="w-4 sm:w-6 text-center text-[10px] sm:text-xs font-bold text-slate-600 flex-shrink-0">{i + 1}</span>
                        <span className="flex-1 min-w-0 truncate text-[11px] sm:text-sm text-slate-300">{s._id || '—'}</span>
                        <div className="w-20 sm:w-32 h-1.5 sm:h-2 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'rgba(52,211,153,0.1)' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, #34d399, #059669)` }} />
                        </div>
                        <span className="w-10 sm:w-16 text-right text-[10px] sm:text-xs font-semibold text-emerald-400 flex-shrink-0">
                          {s.totalDownloads} dl
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
