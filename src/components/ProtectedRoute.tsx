import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NotFound } from './NotFound';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();

  // Show 404 if user is not authenticated or doesn't have the right role
  if (!user || !allowedRoles.includes(user.role)) {
    return <NotFound />;
  }

  return <>{children}</>;
}