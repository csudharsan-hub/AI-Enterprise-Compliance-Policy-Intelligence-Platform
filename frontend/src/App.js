import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import LandingPage       from './pages/LandingPage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import DashboardPage     from './pages/DashboardPage';
import UploadCenterPage  from './pages/UploadCenterPage';
import ReportPage        from './pages/ReportPage';
import HistoryPage       from './pages/HistoryPage';
import ComparePage       from './pages/ComparePage';
import AuditPage         from './pages/AuditPage';
import AdminPage         from './pages/AdminPage';
import ProfilePage       from './pages/ProfilePage';
import NotFoundPage      from './pages/NotFoundPage';
import LoadingSpinner    from './components/common/LoadingSpinner';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark-950"><LoadingSpinner size="lg" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.some(r => hasRole(r))) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark-950"><LoadingSpinner size="lg" /></div>;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const ToastWrapper = () => {
  const { isDark } = useTheme();
  return <ToastContainer position="top-right" autoClose={4000} newestOnTop theme={isDark ? 'dark' : 'light'} toastClassName="text-sm" />;
};

const AppRoutes = () => (
  <Router>
    <ToastWrapper />
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/upload"        element={<ProtectedRoute><UploadCenterPage /></ProtectedRoute>} />
      <Route path="/history"       element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      <Route path="/report/:id"    element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
      <Route path="/compare"       element={<ProtectedRoute><ComparePage /></ProtectedRoute>} />
      <Route path="/audit"         element={<ProtectedRoute roles={['ADMIN','COMPLIANCE_OFFICER','LEGAL']}><AuditPage /></ProtectedRoute>} />
      <Route path="/admin"         element={<ProtectedRoute roles={['ADMIN']}><AdminPage /></ProtectedRoute>} />
      <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Router>
);

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
