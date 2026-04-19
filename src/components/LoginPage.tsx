import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Shield, Lock, Mail, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<'admin' | 'pentester' | 'stakeholder'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email, password });
      toast.success('Login successful!');

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      switch (userData.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'pentester':
          navigate('/pentester');
          break;
        case 'stakeholder':
          navigate('/stakeholder');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSendingRequest(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/v1/forgot-password`, {
        email: forgotEmail
      });

      if (response.data.message) {
        toast.success(response.data.message);
        setIsForgotPasswordOpen(false);
        setForgotEmail('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send password reset request');
    } finally {
      setIsSendingRequest(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Side - Dark */}
      <div style={{ 
        width: '50%', 
        background: 'linear-gradient(to bottom right, #0f172a, #1e3a8a, #0f172a)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          padding: '3rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <Shield style={{ width: '128px', height: '128px', color: '#60a5fa' }} />
          </div>
          <h1 style={{ fontSize: '3.75rem', fontWeight: 'bold', marginBottom: '1rem', background: 'linear-gradient(to right, #60a5fa, #67e8f9, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            PentSecOps
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#93c5fd', marginBottom: '1.5rem' }}>
            Security Operations Platform
          </p>
          <p style={{ color: '#9ca3af', maxWidth: '28rem', lineHeight: '1.75' }}>
            Comprehensive penetration testing and security operations management for modern enterprises
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Hi There!</h2>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Welcome to PentSecOps</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Role Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                Select Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '1rem',
                    border: role === 'admin' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                    background: role === 'admin' ? 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    margin: '0 auto 0.5rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: role === 'admin' ? 'linear-gradient(to bottom right, #3b82f6, #2563eb)' : '#f3f4f6'
                  }}>
                    <Shield style={{ width: '1.5rem', height: '1.5rem', color: role === 'admin' ? 'white' : '#6b7280' }} />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: role === 'admin' ? '#1d4ed8' : '#374151' }}>
                    Admin
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('pentester')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '1rem',
                    border: role === 'pentester' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                    background: role === 'pentester' ? 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    margin: '0 auto 0.5rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: role === 'pentester' ? 'linear-gradient(to bottom right, #3b82f6, #2563eb)' : '#f3f4f6'
                  }}>
                    <Lock style={{ width: '1.5rem', height: '1.5rem', color: role === 'pentester' ? 'white' : '#6b7280' }} />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: role === 'pentester' ? '#1d4ed8' : '#374151' }}>
                    Pentester
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('stakeholder')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '1rem',
                    border: role === 'stakeholder' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                    background: role === 'stakeholder' ? 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    margin: '0 auto 0.5rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: role === 'stakeholder' ? 'linear-gradient(to bottom right, #3b82f6, #2563eb)' : '#f3f4f6'
                  }}>
                    <User style={{ width: '1.5rem', height: '1.5rem', color: role === 'stakeholder' ? 'white' : '#6b7280' }} />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: role === 'stakeholder' ? '#1d4ed8' : '#374151' }}>
                    Stakeholder
                  </span>
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ height: '3.5rem', paddingLeft: '3rem', paddingRight: '1rem' }}
                  className="border-2 border-gray-200 rounded-xl"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ height: '3.5rem', paddingLeft: '3rem', paddingRight: '3.5rem' }}
                  className="border-2 border-gray-200 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                >
                  {showPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={() => setIsForgotPasswordOpen(true)}
                style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              style={{ height: '3.5rem', background: 'linear-gradient(to right, #2563eb, #1d4ed8)', color: 'white', fontSize: '1rem', fontWeight: '600', borderRadius: '0.75rem' }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Don't have an account?{' '}
              <button style={{ color: '#2563eb', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
                Contact Admin
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="!max-w-[420px]" style={{ maxWidth: '420px', width: '420px' }}>
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll escalate your request to the administration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="forgot-email" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> If you don't remember your email, please contact the admin for support.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setForgotEmail('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleForgotPassword}
                disabled={isSendingRequest}
                className="flex-1"
              >
                {isSendingRequest ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
