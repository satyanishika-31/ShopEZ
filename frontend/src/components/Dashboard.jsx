import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { formatCurrency } from '../utils/formatCurrency';
import { useCart } from '../context/CartContext';

const categoriesList = ['All', 'Smart Living', 'Work Essentials', 'Home Comfort', 'Daily Deals'];

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingSymbol, setAddingSymbol] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const fetchProducts = async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
    }
    try {
      const res = await API.get('/stocks', {
        params: {
          search: debouncedSearch || undefined,
          category: activeCategory !== 'All' ? activeCategory : undefined
        }
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
  }, [debouncedSearch, activeCategory]);

  const handleRowClick = (sku) => {
    navigate(`/stocks/${sku}`);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    setAddingSymbol(product.symbol);
    const res = await addToCart(product, 1, product.sizes?.[0] || 'One Size');
    if (res.success) {
      setToastMessage(`Added "${product.name}" to cart!`);
      setTimeout(() => setToastMessage(''), 3000);
    } else {
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(''), 3000);
    }
    setAddingSymbol(null);
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

      {/* Categories Filter Tabs */}
      <div className="flex flex-wrap gap-2.5 pb-2">
        {categoriesList.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
              activeCategory === cat
                ? 'bg-accent text-white border-accent shadow-[0_4px_12px_rgba(109,152,145,0.36)]'
                : 'bg-white/10 hover:bg-white/20 text-textPrimary border-darkBorder/40'
            }`}
          >
            {cat}
          </button>
        ))}
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
                    {product.category && (
                      <span className="absolute right-3 top-3 rounded-lg bg-russett/20 px-2 py-0.5 text-[10px] font-bold text-russett backdrop-blur-md">
                        {product.category}
                      </span>
                    )}
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

                <div className="mt-6 flex items-center justify-between border-t border-darkBorder/40 pt-4 gap-2">
                  <div className="text-xl font-black text-textPrimary truncate">{formatCurrency(product.price)}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={addingSymbol === product.symbol}
                      className="rounded-xl border border-darkBorder bg-white/5 px-3 py-2 text-xs font-bold transition-all hover:bg-accent hover:text-white"
                      title="Add to Cart"
                    >
                      {addingSymbol === product.symbol ? '...' : 'Add 🛒'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(product.symbol);
                      }}
                      className="rounded-xl bg-accent px-3 py-2 text-xs font-bold text-white transition-all hover:bg-accentHover"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-sm text-textSecondary">
            No products found for this category or search query.
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-accent/40 bg-accent/90 px-5 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-md animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
