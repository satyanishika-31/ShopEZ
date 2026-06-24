import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', role: 'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(formData.username, formData.email, formData.password, formData.role);
    setLoading(false);

    if (result.success) {
      navigate(['SELLER', 'ADMIN'].includes(result.user?.role) ? '/admin' : '/markets');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 hero-gradient">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-darkBorder">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-textPrimary tracking-tight">Create Account</h2>
          <p className="text-textSecondary mt-2 text-sm">
            Sign up for ShopEZ shopping or seller access
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-trendDown/10 border border-trendDown/30 text-trendDown rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="shopper123"
              className="w-full bg-darkBg/40 border border-darkBorder focus:border-accent focus:ring-1 focus:ring-accent rounded-xl py-2.5 px-4 text-textPrimary outline-none transition-all placeholder:text-textMuted text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-darkBg/40 border border-darkBorder focus:border-accent focus:ring-1 focus:ring-accent rounded-xl py-2.5 px-4 text-textPrimary outline-none transition-all placeholder:text-textMuted text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              className="w-full bg-darkBg/40 border border-darkBorder focus:border-accent focus:ring-1 focus:ring-accent rounded-xl py-2.5 px-4 text-textPrimary outline-none transition-all placeholder:text-textMuted text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className="w-full bg-darkBg/40 border border-darkBorder focus:border-accent focus:ring-1 focus:ring-accent rounded-xl py-2.5 px-4 text-textPrimary outline-none transition-all placeholder:text-textMuted text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
              Account Type
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-darkBg/40 border border-darkBorder focus:border-accent focus:ring-1 focus:ring-accent rounded-xl py-2.5 px-4 text-textPrimary outline-none transition-all text-sm"
            >
              <option value="USER">User</option>
              <option value="SELLER">Seller</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent to-accentHover hover:shadow-[0_0_15px_rgba(109,152,145,0.34)] py-3 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5 mt-2 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Redirect */}
        <div className="text-center mt-6 text-sm text-textSecondary">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline font-semibold">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
