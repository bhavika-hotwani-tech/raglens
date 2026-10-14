import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard';
import KnowledgeBase from './pages/KnowledgeBase';
import Chat from './pages/Chat';
import Evaluation from './pages/Evaluation';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="knowledge" element={<KnowledgeBase />} />
            <Route path="chat" element={<Chat />} />
            <Route path="evaluation" element={<Evaluation />} />
            <Route path="settings" element={<Navigate to="/" replace />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: "'Inter', sans-serif",
              borderRadius: '0.75rem',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
