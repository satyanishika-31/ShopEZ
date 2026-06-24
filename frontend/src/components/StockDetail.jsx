import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../utils/api';
import BuySellCard from '../components/BuySellCard';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const StockDetail = () => {
  const { symbol } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [purchasedQuantity, setPurchasedQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Physical Cart states
  const [cartQty, setCartQty] = useState(1);
  const [cartSize, setCartSize] = useState('One Size');
  const [cartMsg, setCartMsg] = useState({ text: '', type: '' });
  const [cartLoading, setCartLoading] = useState(false);

  // Comment states
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchData = async (isSilent = false) => {
    try {
      const productRes = await API.get(`/stocks/${symbol}`);
      const prod = productRes.data;
      setProduct(prod);

      if (prod) {
        if (prod.sizes && prod.sizes.length > 0) {
          setCartSize(prod.sizes[0]);
        } else {
          setCartSize('One Size');
        }
      }

      const portfolioRes = await API.get('/portfolio');
      const holdings = portfolioRes.data.holdings;
      const matchingHolding = holdings.find(h => h.symbol === symbol.toUpperCase());
      setPurchasedQuantity(matchingHolding ? matchingHolding.quantity : 0);

      setError('');
    } catch (err) {
      console.error('Failed to fetch product detail data:', err.message);
      if (!isSilent) {
        setError('Error retrieving product data. Check server status.');
      }
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    setCartQty(1);
    setCartMsg({ text: '', type: '' });
    fetchData();
    // eslint-disable-next-line
  }, [symbol]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    setCommentError('');
    try {
      const res = await API.post(`/stocks/${symbol}/comments`, { text: commentText });
      setProduct({ ...product, comments: res.data });
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err.message);
      setCommentError(err.response?.data?.message || 'Could not post comment. Please try again.');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner-custom"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 bg-darkBg px-4 py-12 text-center text-textPrimary">
        <div className="max-w-md rounded-xl border border-trendDown/30 bg-trendDown/10 p-6 text-trendDown">
          {error || 'Requested product listing not found.'}
        </div>
        <Link to="/markets" className="btn-primary-custom">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const reviewScore = 4.4;

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-7xl flex-col gap-6 bg-darkBg px-4 py-8 text-textPrimary md:px-8">
      <div>
        <Link to="/markets" className="flex items-center gap-1 text-sm font-semibold text-textSecondary hover:text-textPrimary">
          Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card grid gap-6 rounded-2xl border border-darkBorder p-6 md:grid-cols-[0.9fr_1.1fr]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="min-h-[260px] rounded-xl border border-darkBorder object-cover"
              />
            ) : (
              <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-darkBorder bg-gradient-to-br from-white/70 via-accent/20 to-geraldine/30">
                <span className="text-5xl font-black text-accent/60">{product.symbol}</span>
              </div>
            )}
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-textMuted flex justify-between items-center">
                  <span>SKU {product.symbol}</span>
                  {product.category && (
                    <span className="rounded-lg bg-russett/15 px-2 py-0.5 text-[10px] font-bold text-russett">
                      {product.category}
                    </span>
                  )}
                </div>
                <h1 className="mt-2 text-3xl font-extrabold text-textPrimary">{product.name}</h1>
                <p className="mt-3 text-sm leading-relaxed text-textSecondary">
                  A curated ShopEZ item with clear pricing, customer review signals, and instant checkout.
                  Buy inventory and receive immediate order confirmation.
                </p>
                <div className="mt-4 flex flex-col gap-1 text-sm border-t border-darkBorder/40 pt-3">
                  <div className="text-xs font-semibold text-textMuted uppercase tracking-wider">Seller Details</div>
                  <div className="text-textSecondary">
                    Name: <span className="font-bold text-textPrimary">{product.sellerId?.username || 'ShopEZ'}</span>
                  </div>
                  {product.sellerId?.email && (
                    <div className="text-textSecondary text-xs">
                      Contact: <span className="font-medium text-accent">{product.sellerId.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-4 mt-2">
                <div className="text-3xl font-black">{formatCurrency(product.price)}</div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl border border-darkBorder bg-white/25 p-3">
                  <span className="block text-xs font-semibold uppercase text-textMuted">Reviews</span>
                  <span className="font-bold text-textPrimary">{reviewScore.toFixed(1)} / 5</span>
                </div>
                <div className="rounded-xl border border-darkBorder bg-white/25 p-3">
                  <span className="block text-xs font-semibold uppercase text-textMuted">Orders</span>
                  <span className="font-bold text-textPrimary">
                    {new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(product.volume || 0)}
                  </span>
                </div>
                <div className="rounded-xl border border-darkBorder bg-white/25 p-3">
                  <span className="block text-xs font-semibold uppercase text-textMuted">Owned</span>
                  <span className="font-bold text-textPrimary">{purchasedQuantity}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card flex flex-col gap-4 rounded-2xl border border-darkBorder p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary">Product Details</h3>
            <div className="grid grid-cols-2 gap-6 text-sm md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-textMuted">Listed Price</span>
                <span className="font-bold text-textPrimary">{formatCurrency(product.open)}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-textMuted">Currency</span>
                <span className="font-bold text-textPrimary">INR</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-textMuted">Units Sold</span>
                <span className="font-bold text-textPrimary">
                  {new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(product.volume || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Product Comments Card */}
          <div className="glass-card flex flex-col gap-4 rounded-2xl border border-darkBorder p-6">
            <h3 className="text-lg font-bold text-textPrimary">Product Comments</h3>
            
            {user?.role === 'USER' ? (
              <form onSubmit={handleAddComment} className="flex flex-col gap-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment about this product..."
                  className="w-full min-h-[80px] rounded-xl border border-darkBorder bg-darkBg/40 px-4 py-3 text-sm text-textPrimary outline-none transition-all placeholder:text-textMuted focus:border-accent focus:ring-1 focus:ring-accent"
                  maxLength={500}
                  required
                ></textarea>
                {commentError && (
                  <div className="text-xs text-trendDown font-semibold">{commentError}</div>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={commentLoading || !commentText.trim()}
                    className="rounded-xl bg-accent px-5 py-2 text-xs font-bold text-white transition-all hover:bg-accentHover disabled:bg-accent/40 disabled:cursor-not-allowed"
                  >
                    {commentLoading ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            ) : user ? (
              <p className="text-xs text-textMuted italic">Only customer accounts can post comments on products.</p>
            ) : (
              <p className="text-xs text-textMuted italic">Please log in to post a comment.</p>
            )}

            <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {product.comments && product.comments.length > 0 ? (
                product.comments.map((comment) => (
                  <div key={comment._id} className="rounded-xl border border-darkBorder/40 bg-white/[0.02] p-4 text-sm flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-accent">@{comment.username}</span>
                      <span className="text-textMuted">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-textSecondary mt-1 whitespace-pre-wrap">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-textSecondary italic text-center py-6">No comments on this product yet. Be the first to share your thoughts!</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Add to Cart Column Box */}
          <div className="glass-card flex flex-col gap-5 rounded-2xl border border-darkBorder p-6">
            <div>
              <h3 className="text-lg font-bold text-textPrimary">Add to Cart</h3>
              <p className="text-xs text-textMuted">Select size and quantity for physical delivery</p>
            </div>

            <div className="flex flex-col gap-4">
              {product.sizes && product.sizes.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setCartSize(size);
                          setCartMsg({ text: '', type: '' });
                        }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
                          cartSize === size
                            ? 'bg-accent text-white border-accent shadow-sm'
                            : 'bg-white/10 text-textPrimary border-darkBorder/40 hover:bg-white/20'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
                  Quantity
                </label>
                <div className="flex items-center gap-2.5 rounded-xl border border-darkBorder bg-darkBg/40 p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => {
                      setCartQty((q) => Math.max(1, q - 1));
                      setCartMsg({ text: '', type: '' });
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 font-bold hover:bg-white/20 text-textPrimary"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-textPrimary">{cartQty}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCartQty((q) => q + 1);
                      setCartMsg({ text: '', type: '' });
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 font-bold hover:bg-white/20 text-textPrimary"
                  >
                    +
                  </button>
                </div>
              </div>

              {cartMsg.text && (
                <div
                  className={`rounded-xl border p-3 text-xs ${
                    cartMsg.type === 'success'
                      ? 'border-trendUp/30 bg-trendUp/10 text-trendUp'
                      : 'border-trendDown/30 bg-trendDown/10 text-trendDown'
                  }`}
                >
                  {cartMsg.text}
                </div>
              )}

              <button
                type="button"
                onClick={async () => {
                  setCartLoading(true);
                  setCartMsg({ text: '', type: '' });
                  const res = await addToCart(product, cartQty, cartSize);
                  if (res.success) {
                    setCartMsg({ text: res.message, type: 'success' });
                    setCartQty(1);
                  } else {
                    setCartMsg({ text: res.message, type: 'error' });
                  }
                  setCartLoading(false);
                }}
                disabled={cartLoading}
                className="w-full rounded-xl bg-accent py-3.5 font-bold text-white shadow-lg transition-all hover:bg-accentHover hover:-translate-y-0.5 disabled:opacity-50"
              >
                {cartLoading ? 'Adding...' : 'Add to Cart 🛒'}
              </button>
            </div>
          </div>

          <BuySellCard
            stock={product}
            ownedQuantity={purchasedQuantity}
            onTradeSuccess={fetchData}
          />
          
          <div className="glass-card rounded-2xl border border-darkBorder p-6">
            <h3 className="text-lg font-bold text-textPrimary">Customer Reviews</h3>
            <div className="mt-4 space-y-4 text-sm text-textSecondary">
              <p>"Arrived quickly, matched the description, and checkout was painless."</p>
              <p>"Clear INR pricing made it easy to buy with confidence."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
