import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import { Home } from './pages/Home';
import { SubmitComplaint } from './pages/SubmitComplaint';
import { TrackComplaint } from './pages/TrackComplaint';
import { PublicBoard } from './pages/PublicBoard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MyComplaints } from './pages/MyComplaints';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminComplaints } from './pages/AdminComplaints';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
    <div className="h-16 w-16 rounded-full bg-surface border border-border flex items-center justify-center text-muted mb-4 shadow-sm">
      <AlertCircle className="w-8 h-8" aria-hidden="true" />
    </div>
    <h2 className="text-2xl font-bold text-text">Page Not Found</h2>
    <p className="text-sm text-muted mt-1 max-w-sm">
      The page you requested could not be located.
    </p>
    <Link
      to="/"
      className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-on-primary text-sm font-semibold transition shadow-sm"
    >
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      <span>Return Home</span>
    </Link>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/submit" element={<SubmitComplaint />} />
            <Route path="/track" element={<TrackComplaint />} />
            <Route path="/public" element={<PublicBoard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Protected Route */}
            <Route
              path="/my-complaints"
              element={
                <ProtectedRoute>
                  <MyComplaints />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <AdminRoute>
                  <AdminComplaints />
                </AdminRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
