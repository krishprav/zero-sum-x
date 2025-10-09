'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Debug: Show current auth state
  console.log('LoginPage: Auth state', { user, isAuthenticated, authLoading });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('LoginPage: User already authenticated, redirecting to /trading');
      router.push('/trading');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('LoginPage: Attempting login with:', { email, password: '***' });
    console.log('LoginPage: Login function:', typeof login);

    // Test localStorage access
    try {
      console.log('LoginPage: Testing localStorage access');
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      console.log('LoginPage: localStorage is accessible');
    } catch (error) {
      console.error('LoginPage: localStorage error:', error);
      setError('Browser storage not accessible. Please check your browser settings.');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      console.log('LoginPage: Login result:', success);
      
      if (success) {
        console.log('LoginPage: Login successful, redirecting to /trading');
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          router.push('/trading');
        }, 100);
      } else {
        console.log('LoginPage: Login failed, showing error');
        setError('Invalid credentials. Use demo@example.com / password');
      }
    } catch (error) {
      console.error('LoginPage: Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="dock-container edge-shadow rounded-3xl p-8 relative overflow-hidden" style={{
          background: `
            linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01), rgba(255,255,255,0.005)),
            linear-gradient(45deg, rgba(255,255,255,0.01), transparent)
          `,
          backdropFilter: 'blur(80px) saturate(200%) brightness(120%)',
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 10px 30px rgba(0, 0, 0, 0.15),
            0 0 0 0.5px rgba(255,255,255,0.05),
            inset 0 1px 0 rgba(255,255,255,0.03),
            inset 0 -1px 0 rgba(255,255,255,0.01)
          `,
          border: '0.5px solid rgba(255,255,255,0.05)',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Zero Sum X</h1>
            <p className="text-neutral-400">Sign in to your trading account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="dock-glass w-full py-3 px-4 bg-gradient-to-r from-blue-500/90 to-blue-600 hover:from-blue-500 hover:to-blue-600/90 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-400 text-sm">
              Demo credentials: demo@example.com / password
            </p>
          </div>

          {/* Debug Info */}
          <div className="dock-container edge-shadow rounded-2xl p-3 mt-4 text-xs relative overflow-hidden" style={{
            background: `
              linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01), rgba(255,255,255,0.005)),
              linear-gradient(45deg, rgba(255,255,255,0.01), transparent)
            `,
            backdropFilter: 'blur(80px) saturate(200%) brightness(120%)',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.3),
              0 10px 30px rgba(0, 0, 0, 0.15),
              0 0 0 0.5px rgba(255,255,255,0.05),
              inset 0 1px 0 rgba(255,255,255,0.03),
              inset 0 -1px 0 rgba(255,255,255,0.01)
            `,
            border: '0.5px solid rgba(255,255,255,0.05)',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}>
            <div className="text-neutral-300 mb-2">Debug Info:</div>
            <div className="text-neutral-400">
              <div>User: {user ? user.email : 'null'}</div>
              <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
              <div>Auth Loading: {authLoading ? 'true' : 'false'}</div>
              <div>Form Loading: {isLoading ? 'true' : 'false'}</div>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={async () => {
                  console.log('Test button clicked');
                  const result = await login('demo@example.com', 'password');
                  console.log('Test login result:', result);
                }}
                className="dock-glass px-3 py-1 bg-gradient-to-r from-blue-600/90 to-blue-700 hover:from-blue-600 hover:to-blue-700/90 text-white text-xs transition-all"
              >
                Test Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
