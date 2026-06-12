import { useEffect, useState } from 'react';
import { 
  LazyBarChart as BarChart,
  LazyBar as Bar,
  LazyLineChart as LineChart,
  LazyLine as Line,
  LazyXAxis as XAxis,
  LazyYAxis as YAxis,
  LazyTooltip as Tooltip,
  LazyResponsiveContainer as ResponsiveContainer,
  LazyCartesianGrid as CartesianGrid
} from '../components/LazyCharts';
import { adminApi } from '../useAdmin';
import StatCard from '../components/StatCard';

const TOOLTIP_STYLE = {
  contentStyle: { background: 'rgba(8,13,26,0.98)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, color: '#e2e8f0', fontSize: 12 },
  cursor: { fill: 'rgba(99,102,241,0.08)' },
};

const TYPE_COLORS = {
  notes: '#818cf8', pyq: '#38bdf8', lab: '#34d399',
  'question-bank': '#e879f9', assignment: '#fbbf24', other: '#94a3b8',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get('/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {[0,1,2,3,4].map(i => <div key={i} className="h-28 sm:h-32 rounded-xl sm:rounded-2xl animate-pulse" style={{ background: 'rgba(15,23,42,0.7)' }} />)}
        </div>
      </div>
    );
  }

  const { counts, byType, byBranch, recentByDay, topSubjects } = stats || {};

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      {/* Header - Mobile Optimized */}
      <div className="px-1">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs lg:text-sm text-slate-500">Platform overview and key metrics</p>
      </div>

      {/* Stat cards - Mobile Optimized Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4 xl:grid-cols-5">
        <StatCard label="Branches"  value={counts?.branches  ?? 0} icon="🏛️" accent="#818cf8" delay={0}    />
        <StatCard label="Schemes"   value={counts?.schemes   ?? 0} icon="📐" accent="#38bdf8" delay={0.06} />
        <StatCard label="Semesters" value={counts?.semesters ?? 0} icon="📅" accent="#34d399" delay={0.12} />
        <StatCard label="Subjects"  value={counts?.subjects  ?? 0} icon="📘" accent="#e879f9" delay={0.18} />
        <StatCard label="Resources" value={counts?.resources ?? 0} icon="📄" accent="#fbbf24" delay={0.24} />
      </div>

      {/* Charts row - Mobile Optimized */}
      <div className="grid gap-3 sm:gap-4 lg:gap-5 xl:grid-cols-2">
        {/* Resources by type */}
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5" style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
          <p className="mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base font-semibold text-slate-200">Resources by Type</p>
          <ResponsiveContainer width="100%" height={180} className="sm:hidden">
            <BarChart data={byType?.map(d => ({ name: d._id, count: d.count })) || []} margin={{ top: 5, right: 5, left: -25, bottom: 5 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[6,6,0,0]} fill="url(#barGrad)" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={220} className="hidden sm:block">
            <BarChart data={byType?.map(d => ({ name: d._id, count: d.count })) || []} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[8,8,0,0]} fill="url(#barGrad)" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resources by branch */}
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5" style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
          <p className="mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base font-semibold text-slate-200">Resources by Branch</p>
          <ResponsiveContainer width="100%" height={180} className="sm:hidden">
            <BarChart data={byBranch?.map(d => ({ name: d._id, count: d.count })) || []} margin={{ top: 5, right: 5, left: -25, bottom: 5 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[6,6,0,0]} fill="url(#barGrad2)" />
              <defs>
                <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={220} className="hidden sm:block">
            <BarChart data={byBranch?.map(d => ({ name: d._id, count: d.count })) || []} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[8,8,0,0]} fill="url(#barGrad2)" />
              <defs>
                <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upload trend - Mobile Optimized */}
      <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5" style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
        <p className="mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base font-semibold text-slate-200">Upload Trend (Last 30 Days)</p>
        <ResponsiveContainer width="100%" height={160} className="sm:hidden">
          <LineChart data={recentByDay?.map(d => ({ date: d._id, count: d.count })) || []} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="count" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 2 }} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={180} className="hidden sm:block">
          <LineChart data={recentByDay?.map(d => ({ date: d._id, count: d.count })) || []} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="count" stroke="#818cf8" strokeWidth={2.5} dot={{ fill: '#818cf8', r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top subjects - Mobile Optimized */}
      <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5" style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(99,102,241,0.12)' }}>
        <p className="mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base font-semibold text-slate-200">Top Subjects by Resources</p>
        <div className="space-y-2.5 sm:space-y-3">
          {(topSubjects || []).map((s, i) => {
            const max = topSubjects[0]?.count || 1;
            const pct = Math.round((s.count / max) * 100);
            return (
              <div key={s._id} className="flex items-center gap-2 sm:gap-3">
                <span className="w-5 sm:w-6 text-center text-[10px] sm:text-xs font-bold text-slate-600 flex-shrink-0">{i + 1}</span>
                <span className="flex-1 min-w-0 truncate text-[11px] sm:text-xs lg:text-sm text-slate-300">{s._id}</span>
                <div className="flex-1 h-1.5 sm:h-2 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
                </div>
                <span className="w-8 sm:w-10 text-right text-[10px] sm:text-xs font-semibold text-slate-400 flex-shrink-0">{s.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
