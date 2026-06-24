import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-textPrimary ${
      isActive ? 'rounded-lg bg-white/5 px-3 py-2 text-textPrimary' : 'text-textSecondary'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-darkBorder bg-darkBg/80 px-4 py-3 backdrop-blur-md md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link className="flex items-center gap-2 text-xl font-bold text-textPrimary md:text-2xl" to="/">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-black text-white">S</span>
          <span>ShopEZ</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink className={navClass} to="/markets">
            Catalog
          </NavLink>
          {user && (
            <>
              <NavLink className={navClass} to="/profile">
                Profile
              </NavLink>
              <NavLink className={navClass} to="/portfolio">
                Orders
              </NavLink>
              <NavLink className={navClass} to="/cart">
                <span className="flex items-center gap-1.5">
                  Cart
                  {cartCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent hover:bg-accentHover px-1.5 text-[10px] font-black text-white shadow-[0_0_8px_rgba(109,152,145,0.6)]">
                      {cartCount}
                    </span>
                  )}
                </span>
              </NavLink>
              {['SELLER', 'ADMIN'].includes(user.role) && (
                <NavLink className={navClass} to="/admin">
                  {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Seller Dashboard'}
                </NavLink>
              )}
            </>
          )}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-textPrimary">
                Hi, {user.username}
                {['SELLER', 'ADMIN'].includes(user.role) && (
                  <span className="ml-2 rounded-full border border-geraldine/40 bg-geraldine/20 px-2 py-0.5 text-xs font-semibold text-russett">
                    {user.role}
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-darkBorder bg-white/5 px-4 py-2 text-sm font-semibold text-textPrimary transition-all hover:border-textSecondary hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-xl border border-darkBorder bg-white/5 px-4 py-2 text-sm font-semibold text-textPrimary transition-all hover:border-textSecondary hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-accent to-accentHover px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(109,152,145,0.34)]"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-textSecondary hover:text-textPrimary md:hidden"
          aria-label="Toggle navigation"
        >
          <span className="block text-2xl leading-none">{mobileMenuOpen ? 'x' : '='}</span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mt-3 flex flex-col gap-3 border-t border-darkBorder pt-3 md:hidden">
          <Link
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 text-sm font-medium text-textSecondary hover:text-textPrimary"
            to="/markets"
          >
            Catalog
          </Link>
          {user && (
            <>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-sm font-medium text-textSecondary hover:text-textPrimary"
                to="/profile"
              >
                Profile
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-sm font-medium text-textSecondary hover:text-textPrimary"
                to="/portfolio"
              >
                Orders
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 flex items-center justify-between text-sm font-medium text-textSecondary hover:text-textPrimary"
                to="/cart"
              >
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="rounded-full bg-accent text-white px-2.5 py-0.5 text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
              {['SELLER', 'ADMIN'].includes(user.role) && (
                <Link
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 text-sm font-medium text-textSecondary hover:text-textPrimary"
                  to="/admin"
                >
                  {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Seller Dashboard'}
                </Link>
              )}
            </>
          )}

          <div className="flex flex-col gap-3 border-t border-darkBorder pt-3">
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-textPrimary">
                  Logged in as <span className="text-accent">{user.username}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="mt-1 w-full rounded-xl border border-darkBorder bg-white/5 py-2 text-sm font-semibold text-textPrimary transition-all hover:bg-white/10"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-xl border border-darkBorder bg-white/5 py-2 text-center text-sm font-semibold text-textPrimary"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-xl bg-gradient-to-r from-accent to-accentHover py-2 text-center text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
