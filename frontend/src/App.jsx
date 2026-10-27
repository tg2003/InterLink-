import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import SignUpStudent from './pages/SignUpStudent';
import SignUpUniversity from './pages/SignUpUniversity';
import SignUpEmployer from './pages/SignUpEmployer';
import SignUpSupervisor from './pages/SignUpSupervisor';

// Dashboards
import DashboardAdmin from './pages/dashboards/DashboardAdmin';
import DashboardStudent from './pages/dashboards/DashboardStudent';
import DashboardUniversity from './pages/dashboards/DashboardUniversity';
import DashboardSupervisor from './pages/dashboards/DashboardSupervisor';
import DashboardEmployer from './pages/dashboards/DashboardEmployer';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing / Home Page with in-page smooth-scroll sections #home, #about */}
          <Route path="/" element={<Home />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup/student" element={<SignUpStudent />} />
          <Route path="/signup/university" element={<SignUpUniversity />} />
          <Route path="/signup/employer" element={<SignUpEmployer />} />
          <Route path="/signup/supervisor" element={<SignUpSupervisor />} />

          {/* Role-Specific Protected Dashboards (Sprint 1 Placeholders) */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRole="student">
                <DashboardStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/university"
            element={
              <ProtectedRoute allowedRole="university">
                <DashboardUniversity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/supervisor"
            element={
              <ProtectedRoute allowedRole="supervisor">
                <DashboardSupervisor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/employer"
            element={
              <ProtectedRoute allowedRole="employer">
                <DashboardEmployer />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
