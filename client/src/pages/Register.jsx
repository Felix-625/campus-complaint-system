import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Mail, Lock, Building, AlertCircle, ArrowRight } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password, formData.department);
      navigate('/my-complaints');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Please make sure the email is valid and not already in use.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
          Create Student Account
        </h2>
        <p className="mt-1 text-center text-xs text-muted">
          Track personal complaints, save status history, and upvote community reports.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface py-8 px-6 shadow-sm border border-border rounded-lg sm:px-10">
          {error && (
            <div
              id="register-error"
              className="mb-6 p-4 rounded-md bg-status-rejected-bg/15 border border-danger text-danger text-xs sm:text-sm flex items-start space-x-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
                Full Name <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={formData.name}
                  onChange={handleChange}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'register-error' : undefined}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-border bg-surface text-sm placeholder:text-muted text-text focus:outline-none focus:ring-2 focus:ring-focus-ring transition min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
                Campus Email <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="student@campus.edu"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'register-error' : undefined}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-border bg-surface text-sm placeholder:text-muted text-text focus:outline-none focus:ring-2 focus:ring-focus-ring transition min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
                Department / Major (Optional)
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-muted absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  type="text"
                  name="department"
                  placeholder="e.g. Computer Science, Engineering"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-border bg-surface text-sm placeholder:text-muted text-text focus:outline-none focus:ring-2 focus:ring-focus-ring transition min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
                Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'register-error' : undefined}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-border bg-surface text-sm placeholder:text-muted text-text focus:outline-none focus:ring-2 focus:ring-focus-ring transition min-h-[44px]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-md bg-primary hover:bg-primary-hover text-on-primary font-semibold text-sm shadow-sm transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Student Account</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
