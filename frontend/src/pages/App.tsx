import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AppLayout } from '../layouts/AppLayout';
import LoginPage from './LoginPage';

// Role-based pages
import StudentStartExamPage from './roles/StudentStartExamPage';
import StudentReviewedIncidentsPage from './roles/StudentReviewedIncidentsPage';
import ProctorReviewIncidentsPage from './roles/ProctorReviewIncidentsPage';
import AdminIncidentsPage from './roles/AdminIncidentsPage';
import AdminCreateExamPage from './roles/AdminCreateExamPage';

// Demo pages (for development/testing)
import StartSessionPage from './StartSessionPage';
import IngestDemoPage from './IngestDemoPage';
import IncidentsPage from './IncidentsPage';
import ReviewPage from './ReviewPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        {/* Student routes */}
        <Route path="student/exam" element={<StudentStartExamPage />} />
        <Route path="student/incidents" element={<StudentReviewedIncidentsPage />} />
        
        {/* Proctor/Reviewer routes */}
        <Route path="proctor/review" element={<ProctorReviewIncidentsPage />} />
        <Route path="proctor/stats" element={<div>Stats coming soon</div>} />
        
        {/* Admin routes */}
        <Route path="admin/incidents" element={<AdminIncidentsPage />} />
        <Route path="admin/create-exam" element={<AdminCreateExamPage />} />
        <Route path="admin/stats" element={<div>Admin stats coming soon</div>} />
        
        {/* Demo/dev pages */}
        <Route path="demo/start-session" element={<StartSessionPage />} />
        <Route path="demo/ingest" element={<IngestDemoPage />} />
        <Route path="demo/incidents" element={<IncidentsPage />} />
        <Route path="demo/review" element={<ReviewPage />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/student/exam" />} />
      </Route>
    </Routes>
  );
};

export default App;
