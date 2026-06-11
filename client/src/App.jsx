import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';

// Immediate load - needed for initial render
import Layout from './components/Layout';
import Landing from './pages/Landing';

// Lazy load all other pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Results = lazy(() => import('./pages/Results'));
const Calculator = lazy(() => import('./pages/Calculator'));
const ExamCalendar = lazy(() => import('./pages/ExamCalendar'));
const Notifications = lazy(() => import('./pages/Notifications'));
const ResourceRequests = lazy(() => import('./pages/ResourceRequests'));
const AIChatBot = lazy(() => import('./pages/AIChatBot'));
const QuestionPaperAnalyzer = lazy(() => import('./pages/QuestionPaperAnalyzer'));
const Resources = lazy(() => import('./pages/Resources'));
const Subjects = lazy(() => import('./pages/Subjects'));
const BranchSchemes = lazy(() => import('./pages/BranchSchemes'));
const Semesters = lazy(() => import('./pages/Semesters'));
const SubjectsBySemester = lazy(() => import('./pages/SubjectsBySemester'));
const SubjectDetail = lazy(() => import('./pages/SubjectDetail'));
const SubjectResources = lazy(() => import('./pages/SubjectResources'));

// Admin - lazy load
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const ProtectedRoute = lazy(() => import('./admin/components/ProtectedRoute'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminBranches = lazy(() => import('./admin/pages/AdminBranches'));
const AdminSchemes = lazy(() => import('./admin/pages/AdminSchemes'));
const AdminSemesters = lazy(() => import('./admin/pages/AdminSemesters'));
const AdminSubjects = lazy(() => import('./admin/pages/AdminSubjects'));
const AdminResources = lazy(() => import('./admin/pages/AdminResources'));
const AdminExams = lazy(() => import('./admin/pages/AdminExams'));
const AdminNotifications = lazy(() => import('./admin/pages/AdminNotifications'));
const AdminAnalytics = lazy(() => import('./admin/pages/AdminAnalytics'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl"
        style={{
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)'
        }}>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-sm font-medium text-indigo-400">Loading...</span>
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <LanguageProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Public site */}
          <Route path="/home" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="results" element={<Results />} />
            <Route path="calculator" element={<Calculator />} />
            <Route path="exam-calendar" element={<ExamCalendar />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="resource-requests" element={<ResourceRequests />} />
            <Route path="ai-assistant" element={<AIChatBot />} />
            <Route path="qp-analyzer" element={<QuestionPaperAnalyzer />} />
            <Route path="resources" element={<Resources />} />
            <Route path="branches/:branchId" element={<BranchSchemes />} />
            <Route path="branches/:branchId/schemes/:schemeId" element={<Semesters />} />
            <Route path="branches/:branchId/schemes/:schemeId/semesters/:semesterNumber" element={<SubjectsBySemester />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="subjects/:subjectId" element={<SubjectDetail />} />
            <Route path="subjects/:subjectId/resources/:category" element={<SubjectResources />} />
          </Route>

          {/* Admin login - Public access */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin panel - Protected, requires login */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="branches"  element={<AdminBranches />} />
            <Route path="schemes"   element={<AdminSchemes />} />
            <Route path="semesters" element={<AdminSemesters />} />
            <Route path="subjects"  element={<AdminSubjects />} />
            <Route path="resources" element={<AdminResources />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </LanguageProvider>
  );
};

export default App;
