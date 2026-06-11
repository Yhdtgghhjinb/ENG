import { lazy, Suspense } from 'react';

// Lazy load all Recharts components
const BarChart = lazy(() => import('recharts').then(m => ({ default: m.BarChart })));
const Bar = lazy(() => import('recharts').then(m => ({ default: m.Bar })));
const LineChart = lazy(() => import('recharts').then(m => ({ default: m.LineChart })));
const Line = lazy(() => import('recharts').then(m => ({ default: m.Line })));
const PieChart = lazy(() => import('recharts').then(m => ({ default: m.PieChart })));
const Pie = lazy(() => import('recharts').then(m => ({ default: m.Pie })));
const XAxis = lazy(() => import('recharts').then(m => ({ default: m.XAxis })));
const YAxis = lazy(() => import('recharts').then(m => ({ default: m.YAxis })));
const Tooltip = lazy(() => import('recharts').then(m => ({ default: m.Tooltip })));
const Legend = lazy(() => import('recharts').then(m => ({ default: m.Legend })));
const ResponsiveContainer = lazy(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })));
const CartesianGrid = lazy(() => import('recharts').then(m => ({ default: m.CartesianGrid })));
const Cell = lazy(() => import('recharts').then(m => ({ default: m.Cell })));

// Loading fallback
const ChartLoader = () => (
  <div className="flex items-center justify-center h-64 text-slate-500 animate-pulse">
    <div className="flex gap-2 items-center">
      <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
      <span>Loading chart...</span>
    </div>
  </div>
);

// Wrapper components with Suspense
export const LazyBarChart = ({ children, ...props }) => (
  <Suspense fallback={<ChartLoader />}>
    <BarChart {...props}>{children}</BarChart>
  </Suspense>
);

export const LazyBar = (props) => (
  <Suspense fallback={null}>
    <Bar {...props} />
  </Suspense>
);

export const LazyLineChart = ({ children, ...props }) => (
  <Suspense fallback={<ChartLoader />}>
    <LineChart {...props}>{children}</LineChart>
  </Suspense>
);

export const LazyLine = (props) => (
  <Suspense fallback={null}>
    <Line {...props} />
  </Suspense>
);

export const LazyPieChart = ({ children, ...props }) => (
  <Suspense fallback={<ChartLoader />}>
    <PieChart {...props}>{children}</PieChart>
  </Suspense>
);

export const LazyPie = (props) => (
  <Suspense fallback={null}>
    <Pie {...props} />
  </Suspense>
);

export const LazyXAxis = (props) => (
  <Suspense fallback={null}>
    <XAxis {...props} />
  </Suspense>
);

export const LazyYAxis = (props) => (
  <Suspense fallback={null}>
    <YAxis {...props} />
  </Suspense>
);

export const LazyTooltip = (props) => (
  <Suspense fallback={null}>
    <Tooltip {...props} />
  </Suspense>
);

export const LazyLegend = (props) => (
  <Suspense fallback={null}>
    <Legend {...props} />
  </Suspense>
);

export const LazyResponsiveContainer = ({ children, ...props }) => (
  <Suspense fallback={<ChartLoader />}>
    <ResponsiveContainer {...props}>{children}</ResponsiveContainer>
  </Suspense>
);

export const LazyCartesianGrid = (props) => (
  <Suspense fallback={null}>
    <CartesianGrid {...props} />
  </Suspense>
);

export const LazyCell = (props) => (
  <Suspense fallback={null}>
    <Cell {...props} />
  </Suspense>
);
