import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const authUser = await login(email, password);
      if (authUser?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(from === '/login' ? '/my-complaints' : from);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-1 text-center text-xs text-muted">
          Access your personal complaints, upvote campus issues, or manage system resolutions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface py-8 px-6 shadow-sm border border-border rounded-lg sm:px-10">
          {error && (
            <div
              id="login-error"
              className="mb-6 p-4 rounded-md bg-status-rejected-bg/15 border border-danger text-danger text-xs sm:text-sm flex items-start space-x-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  type="email"
                  required
                  placeholder="name@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'login-error' : undefined}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-border bg-surface text-sm placeholder:text-muted text-text focus:outline-none focus:ring-2 focus:ring-focus-ring transition min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'login-error' : undefined}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-border bg-surface text-sm placeholder:text-muted text-text focus:outline-none focus:ring-2 focus:ring-focus-ring transition min-h-[44px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-md bg-primary hover:bg-primary-hover text-on-primary font-semibold text-sm shadow-sm transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted">
            Don't have a student account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
