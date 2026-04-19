import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { PentesterDashboard } from './components/PentesterDashboard';
import { StakeholderDashboard } from './components/StakeholderDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NotFound } from './components/NotFound';

export type UserRole = 'admin' | 'pentester' | 'stakeholder' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'pentester' | 'stakeholder';
}

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/log-in" element={<LoginPage />} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/pentester" element={
          <ProtectedRoute allowedRoles={['pentester']}>
            <PentesterDashboard />
          </ProtectedRoute>
        } />
        <Route path="/stakeholder" element={
          <ProtectedRoute allowedRoles={['stakeholder']}>
            <StakeholderDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
