import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const categories = ['Smart Living', 'Work Essentials', 'Home Comfort', 'Daily Deals'];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[85vh] bg-darkBg text-textPrimary">
      <section className="relative overflow-hidden hero-gradient px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex max-w-3xl flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent md:text-sm">
              Fresh deals, trusted sellers, fast checkout
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              ShopEZ
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-textSecondary md:text-xl">
              Your one-stop destination for effortless online shopping. Browse detailed product pages,
              compare customer reviews, unlock discounts, and complete secure checkout with instant
              order confirmation.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/markets"
                className="rounded-xl bg-gradient-to-r from-accent to-accentHover px-8 py-3.5 font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(109,152,145,0.34)]"
              >
                Browse Catalog
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="rounded-xl border border-darkBorder bg-white/5 px-8 py-3.5 font-bold text-textPrimary transition-all hover:-translate-y-0.5 hover:border-textSecondary hover:bg-white/10"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>

          <div className="glass-card grid gap-4 rounded-2xl border border-darkBorder p-5">
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <div key={category} className="rounded-xl border border-darkBorder bg-white/25 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-textMuted">
                    Collection {index + 1}
                  </div>
                  <div className="mt-2 text-lg font-extrabold text-textPrimary">{category}</div>
                  <div className="mt-4 h-24 rounded-lg bg-gradient-to-br from-white/70 via-accent/20 to-geraldine/30"></div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-accent/20 bg-accent/10 p-4">
              <div className="text-sm font-bold text-textPrimary">Seller growth tools included</div>
              <p className="mt-1 text-sm text-textSecondary">
                Manage listings, monitor orders, and review revenue signals from one focused dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-textPrimary">Everything shoppers expect</h2>
          <p className="mt-2 text-textSecondary">
            Built around product discovery, confident buying, and simple seller operations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="glass-card flex flex-col gap-4 rounded-2xl border border-darkBorder p-6">
            <div className="text-sm font-bold uppercase tracking-wider text-accent">Catalog</div>
            <h3 className="text-xl font-bold text-textPrimary">Detailed product browsing</h3>
            <p className="text-sm leading-relaxed text-textSecondary">
              Search SKUs, inspect INR pricing, review product details, and jump into product pages
              designed for quick decisions.
            </p>
          </div>

          <div className="glass-card flex flex-col gap-4 rounded-2xl border border-darkBorder p-6">
            <div className="text-sm font-bold uppercase tracking-wider text-accent">Checkout</div>
            <h3 className="text-xl font-bold text-textPrimary">Secure instant confirmation</h3>
            <p className="text-sm leading-relaxed text-textSecondary">
              Place orders for approved seller products and receive immediate confirmation after every
              successful checkout.
            </p>
          </div>

          <div className="glass-card flex flex-col gap-4 rounded-2xl border border-darkBorder p-6">
            <div className="text-sm font-bold uppercase tracking-wider text-accent">Sellers</div>
            <h3 className="text-xl font-bold text-textPrimary">Order and listing management</h3>
            <p className="text-sm leading-relaxed text-textSecondary">
              The seller dashboard centralizes product listings, customer accounts, order logs, and
              analytics that show what is moving.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-darkBorder py-8 text-center text-xs text-textMuted">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p>© {new Date().getFullYear()} ShopEZ. Effortless shopping for customers and sellers.</p>
          <div className="flex gap-4">
            <Link to="/markets" className="transition-colors hover:text-textSecondary">Catalog</Link>
            <Link to="/portfolio" className="transition-colors hover:text-textSecondary">Orders</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
