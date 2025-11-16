import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import UnauthorizedPage from './UnauthorizedPage';

// Demo pages (legacy)
import StartSessionPage from './StartSessionPage';
import IngestDemoPage from './IngestDemoPage';
import IncidentsPage from './IncidentsPage';
import ReviewPage from './ReviewPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
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

        {/* Placeholder routes for menu items */}
        <Route
          path="/exams"
          element={
            <ProtectedRoute allowedRoles={['CANDIDATE']}>
              <DashboardLayout>
                <div style={{ padding: 24, background: 'white', borderRadius: 8 }}>
                  <h2>Danh sách kỳ thi</h2>
                  <p>Trang này sẽ được phát triển ở tuần 2</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
