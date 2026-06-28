import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GeneratorPage from './pages/GeneratorPage';
import HistoryPage from './pages/HistoryPage';
import SavedPage from './pages/SavedPage';
import SchemaPage from './pages/SchemaPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import './styles/globals.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d0d1a' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="generator" element={<GeneratorPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="saved" element={<SavedPage />} />
        <Route path="schema" element={<SchemaPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#f0f0ff',
              border: '1px solid #2a2a45',
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            },
            success: { iconTheme: { primary: '#00d4a0', secondary: '#1a1a2e' } },
            error: { iconTheme: { primary: '#ff4d6d', secondary: '#1a1a2e' } }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
