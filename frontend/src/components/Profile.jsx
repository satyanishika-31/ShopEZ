import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-4xl flex-col gap-6 bg-darkBg px-4 py-8 text-textPrimary md:px-8">
      <div>
        <h1 className="text-2xl font-extrabold md:text-3xl">
          {user?.role === 'SELLER' ? 'Seller Profile' : user?.role === 'ADMIN' ? 'Admin Profile' : 'User Profile'}
        </h1>
        <p className="mt-1 text-sm text-textSecondary">
          Your ShopEZ account details and role access.
        </p>
      </div>

      <div className="glass-card grid gap-5 rounded-2xl border border-darkBorder p-6 md:grid-cols-[auto_1fr]">
        <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-accent text-4xl font-black text-white">
          {user?.username?.charAt(0)?.toUpperCase() || 'S'}
        </div>
        <div className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-textMuted">Username</div>
            <div className="mt-1 text-lg font-bold text-textPrimary">{user?.username}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-textMuted">Role</div>
            <div className="mt-1 text-lg font-bold text-accent">{user?.role}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-textMuted">Email</div>
            <div className="mt-1 text-lg font-bold text-textPrimary">{user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
