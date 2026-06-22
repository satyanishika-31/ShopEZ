import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password, formData.role);
    setLoading(false);

    if (result.success) {
      const nextRole = result.user?.role || user?.role;
      navigate(['SELLER', 'ADMIN'].includes(nextRole) ? '/admin' : '/markets');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 hero-gradient">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-darkBorder">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-textPrimary tracking-tight">Welcome Back</h2>
          <p className="text-textSecondary mt-2 text-sm">
            Sign in to browse ShopEZ, place orders, or manage seller inventory
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-trendDown/10 border border-trendDown/30 text-trendDown rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-darkBg/40 border border-darkBorder focus:border-accent focus:ring-1 focus:ring-accent rounded-xl py-3 px-4 text-textPrimary outline-none transition-all placeholder:text-textMuted text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full bg-darkBg/40 border border-darkBorder focus:border-accent focus:ring-1 focus:ring-accent rounded-xl py-3 px-4 text-textPrimary outline-none transition-all placeholder:text-textMuted text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
              Login As
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-darkBg/40 border border-darkBorder focus:border-accent focus:ring-1 focus:ring-accent rounded-xl py-3 px-4 text-textPrimary outline-none transition-all text-sm"
            >
              <option value="USER">User</option>
              <option value="SELLER">Seller</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent to-accentHover hover:shadow-[0_0_15px_rgba(109,152,145,0.34)] py-3.5 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5 mt-2 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Register Redirect */}
        <div className="text-center mt-6 text-sm text-textSecondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
