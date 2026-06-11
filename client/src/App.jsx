import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Calculator from './pages/Calculator';
import ExamCalendar from './pages/ExamCalendar';
import Discussions from './pages/Discussions';
import DiscussionDetail from './pages/DiscussionDetail';
import Notifications from './pages/Notifications';
import ResourceRequests from './pages/ResourceRequests';
import Leaderboard from './pages/Leaderboard';
import Resources from './pages/Resources';
import Subjects from './pages/Subjects';
import BranchSchemes from './pages/BranchSchemes';
import Semesters from './pages/Semesters';
import SubjectsBySemester from './pages/SubjectsBySemester';
import SubjectDetail from './pages/SubjectDetail';
import SubjectResources from './pages/SubjectResources';

// Admin
import AdminLayout from './admin/components/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import ProtectedRoute from './admin/components/ProtectedRoute';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminBranches from './admin/pages/AdminBranches';
import AdminSchemes from './admin/pages/AdminSchemes';
import AdminSemesters from './admin/pages/AdminSemesters';
import AdminSubjects from './admin/pages/AdminSubjects';
import AdminResources from './admin/pages/AdminResources';
import AdminExams from './admin/pages/AdminExams';
import AdminNotifications from './admin/pages/AdminNotifications';
import AdminAnalytics from './admin/pages/AdminAnalytics';

const App = () => {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Public site */}
      <Route path="/home" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="calculator" element={<Calculator />} />
        <Route path="exam-calendar" element={<ExamCalendar />} />
        <Route path="discussions" element={<Discussions />} />
        <Route path="discussions/:id" element={<DiscussionDetail />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="resource-requests" element={<ResourceRequests />} />
        <Route path="leaderboard" element={<Leaderboard />} />
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
  );
};

export default App;
