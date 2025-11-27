import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from './LoginPage';
import LoginPageNew from './LoginPageNew';
import RegisterPage from './RegisterPage';

import DashboardPage from './DashboardPage';
import UnauthorizedPage from './UnauthorizedPage';

// Demo pages (legacy)
import StartSessionPage from './StartSessionPage';
import IngestDemoPage from './IngestDemoPage';
import IncidentsPage from './IncidentsPage';
import ReviewPage from './ReviewPage';

// Week 2: Mock Exam
import { MockExamPage } from './MockExamPage';

// Candidate pages
import { ExamsPage } from './roles/ExamsPage';
import { MyResultsPage } from './roles/MyResultsPage';
import { MyViolationsPage } from './roles/MyViolationsPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPageNew />} />
        <Route path="/login-legacy" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected routes with Dashboard Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Legacy demo pages (wrapped in layout) */}
        <Route
          path="/demo/start-session"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <StartSessionPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/demo/ingest"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <IngestDemoPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/demo/incidents"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <IncidentsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/demo/review"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ReviewPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Candidate routes */}
        <Route
          path="/candidate/exams"
          element={
            <ProtectedRoute allowedRoles={['CANDIDATE']}>
              <DashboardLayout>
                <ExamsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams"
          element={<Navigate to="/candidate/exams" replace />}
        />
        <Route
          path="/mock-exam/:examId"
          element={
            <MockExamPage />
          }
        />
        <Route
          path="/candidate/my-results"
          element={
            <ProtectedRoute allowedRoles={['CANDIDATE']}>
              <DashboardLayout>
                <MyResultsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-results"
          element={<Navigate to="/candidate/my-results" replace />}
        />
        <Route
          path="/candidate/my-violations"
          element={
            <ProtectedRoute allowedRoles={['CANDIDATE']}>
              <DashboardLayout>
                <MyViolationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-violations"
          element={<Navigate to="/candidate/my-violations" replace />}
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
