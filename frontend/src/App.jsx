import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Salaries from './pages/Salaries';
import Accounts from './pages/Accounts';

const ALL_ROLES = ['admin', 'manager', 'employee'];
const MANAGER_ROLES = ['admin', 'manager'];

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route
                      path="/dashboard"
                      element={<ProtectedRoute allowedRoles={ALL_ROLES}><Dashboard /></ProtectedRoute>}
                    />
                    <Route
                      path="/employees"
                      element={<ProtectedRoute allowedRoles={MANAGER_ROLES.concat('employee')}><Employees /></ProtectedRoute>}
                    />
                    <Route
                      path="/attendance"
                      element={<ProtectedRoute allowedRoles={ALL_ROLES}><Attendance /></ProtectedRoute>}
                    />
                    <Route
                      path="/leaves"
                      element={<ProtectedRoute allowedRoles={ALL_ROLES}><Leaves /></ProtectedRoute>}
                    />
                    <Route
                      path="/salaries"
                      element={<ProtectedRoute allowedRoles={ALL_ROLES}><Salaries /></ProtectedRoute>}
                    />
                    <Route
                      path="/accounts"
                      element={<ProtectedRoute allowedRoles={['admin']}><Accounts /></ProtectedRoute>}
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
