import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { formatCurrency } from '../utils/formatCurrency';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
    }
    try {
      const res = await API.get('/stocks', {
        params: { search: debouncedSearch || undefined }
      });
      setProducts(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch products:', err.message);
      if (!isSilent) {
        setError('Could not fetch catalog data. Please verify the server connection.');
      }
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchProducts(products.length > 0);
    // eslint-disable-next-line
  }, [debouncedSearch]);

  const handleRowClick = (sku) => {
    navigate(`/stocks/${sku}`);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner-custom"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-7xl flex-col gap-6 bg-darkBg px-4 py-8 text-textPrimary md:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold md:text-3xl">
            ShopEZ Product Catalog
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            Browse approved seller products with consistent INR checkout pricing.
          </p>
        </div>

        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search by SKU or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-darkBorder bg-darkCard/50 px-4 py-2.5 text-sm text-textPrimary outline-none transition-all placeholder:text-textMuted focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-trendDown/30 bg-trendDown/10 p-4 text-sm text-trendDown">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.length > 0 ? (
          products.map((product) => {
            return (
              <div
                key={product.symbol}
                onClick={() => handleRowClick(product.symbol)}
                className="glass-card flex flex-col justify-between overflow-hidden rounded-2xl border border-darkBorder bg-darkCard/30 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-darkCard/50 cursor-pointer"
              >
                <div>
                  <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl bg-darkBg/60">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-accent/20 text-3xl font-black text-accent/60">
                        {product.symbol}
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-lg bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent backdrop-blur-md">
                      {product.symbol}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-textPrimary truncate">{product.name}</h3>
                    <div className="mt-2 flex items-center justify-between text-xs text-textSecondary">
                      <span>Seller:</span>
                      <span className="font-semibold text-textPrimary truncate max-w-[150px]">
                        {product.sellerId?.username || 'ShopEZ'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-textSecondary">
                      <span>Volume:</span>
                      <span className="font-bold text-accent">
                        {new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(product.volume || 0)} orders
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-darkBorder/40 pt-4">
                  <div className="text-xl font-black text-textPrimary">{formatCurrency(product.price)}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(product.symbol);
                    }}
                    className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white transition-all hover:bg-accentHover hover:shadow-[0_0_15px_rgba(109,152,145,0.34)]"
                  >
                    View Product
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-sm text-textSecondary">
            No products match your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

