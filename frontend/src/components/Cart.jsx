import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import API from '../utils/api';

const Cart = () => {
  const { cartItems, cartCount, loading: cartLoading, increaseQty, decreaseQty, removeItem, fetchCart, clearCartLocal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Checkout form state
  const [shippingDetails, setShippingDetails] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    pincode: '',
    paymentMethod: 'Cash on Delivery'
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Pre-fill user details
  useEffect(() => {
    if (user) {
      setShippingDetails((prev) => ({
        ...prev,
        name: user.username || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    const { name, email, mobile, address, pincode, paymentMethod } = shippingDetails;
    if (!name || !email || !mobile || !address || !pincode) {
      setCheckoutError('Please fill in all shipping details.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      await API.post('/orders/place-cart-order', {
        name,
        email,
        mobile,
        address,
        pincode,
        paymentMethod
      });
      setCheckoutSuccess(true);
      clearCartLocal();
    } catch (err) {
      console.error('Checkout error:', err.message);
      setCheckoutError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartLoading && cartItems.length === 0) {
    return (
      <div className="loader-container">
        <div className="spinner-custom"></div>
      </div>
    );
  }

  if (checkoutSuccess) {
    return (
      <div className="mx-auto flex max-w-2xl min-h-[75vh] flex-col items-center justify-center gap-6 px-4 text-center text-textPrimary">
        <div className="glass-card flex flex-col items-center gap-5 rounded-2xl border border-accent/40 bg-accent/10 p-8 shadow-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-3xl font-bold text-white shadow-md animate-bounce">
            ✓
          </div>
          <h1 className="text-3xl font-extrabold">Order Confirmed!</h1>
          <p className="text-sm leading-relaxed text-textSecondary max-w-md">
            Thank you for your purchase. Your order has been placed successfully and is being processed. 
            We've sent a confirmation email to <span className="font-bold text-textPrimary">{shippingDetails.email}</span>.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                navigate('/portfolio');
              }}
              className="rounded-xl bg-accent px-6 py-3 font-bold text-white transition-all hover:bg-accentHover hover:shadow-lg"
            >
              View Order History
            </button>
            <Link
              to="/markets"
              className="rounded-xl border border-darkBorder bg-white/5 px-6 py-3 font-bold text-textPrimary transition-all hover:bg-white/10"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-7xl flex-col gap-6 bg-darkBg px-4 py-8 text-textPrimary md:px-8">
      <div>
        <h1 className="text-2xl font-extrabold md:text-3xl">Your Shopping Cart</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Review your selections, adjust quantities, and check out with ease.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-6 rounded-2xl border border-darkBorder p-12 text-center">
          <div className="text-6xl">🛒</div>
          <div>
            <h3 className="text-lg font-bold">Your cart is empty</h3>
            <p className="mt-1 text-sm text-textSecondary">Explore our catalog to find fresh deals!</p>
          </div>
          <Link to="/markets" className="btn-primary-custom text-sm">
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
          {/* Cart Items List */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="glass-card grid gap-4 rounded-xl border border-darkBorder p-4 md:grid-cols-[100px_1fr_auto] md:items-center"
              >
                {/* Item Image */}
                <div className="h-24 w-24 overflow-hidden rounded-lg border border-darkBorder bg-darkBg/60">
                  {item.mainImg ? (
                    <img src={item.mainImg} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-black text-accent/60">
                      ShopEZ
                    </div>
                  )}
                </div>

                {/* Item Description */}
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-textPrimary text-lg">{item.title}</h3>
                  <div className="text-xs text-textMuted flex gap-3">
                    <span>Size: <strong className="text-textSecondary">{item.size || 'One Size'}</strong></span>
                    {item.discount > 0 && (
                      <span className="text-trendDown">Discount: {item.discount}% off</span>
                    )}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-accent">
                    {formatCurrency(item.price)} each
                  </div>
                </div>

                {/* Quantity & Delete Controls */}
                <div className="flex items-center justify-between gap-6 border-t border-darkBorder/30 pt-3 md:border-t-0 md:pt-0">
                  <div className="flex items-center gap-2.5 rounded-lg border border-darkBorder bg-darkBg/30 p-1">
                    <button
                      onClick={() => decreaseQty(item._id)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-white/10 font-bold hover:bg-white/20"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => increaseQty(item._id)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-white/10 font-bold hover:bg-white/20"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-textMuted uppercase tracking-wider font-semibold">Total</div>
                      <div className="text-base font-extrabold text-textPrimary">
                        {formatCurrency(item.quantity * item.price)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item._id)}
                      className="rounded-lg p-2 text-trendDown hover:bg-trendDown/10 transition-colors"
                      title="Remove product"
                      aria-label="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Panel */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="glass-card flex flex-col gap-5 rounded-2xl border border-darkBorder p-6">
              <div>
                <h3 className="text-lg font-bold text-textPrimary">Order Summary</h3>
                <p className="text-xs text-textMuted">Complete your details to finalize order</p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-darkBorder/40 bg-darkBg/30 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-textSecondary">Subtotal ({cartCount} items):</span>
                  <span className="font-semibold text-textPrimary">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textSecondary">Delivery:</span>
                  <span className="font-semibold text-trendUp">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textSecondary">Estimated Tax:</span>
                  <span className="font-semibold text-textPrimary">₹0.00</span>
                </div>
                <hr className="my-1.5 border-darkBorder" />
                <div className="flex justify-between text-base font-bold">
                  <span className="text-textPrimary">Order Total:</span>
                  <span className="text-accent">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              {checkoutError && (
                <div className="rounded-xl border border-trendDown/30 bg-trendDown/10 p-3 text-xs text-trendDown">
                  {checkoutError}
                </div>
              )}

              <form onSubmit={handleCheckout} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Shipping Name</label>
                  <input
                    type="text"
                    name="name"
                    value={shippingDetails.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="rounded-xl border border-darkBorder bg-darkBg/40 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingDetails.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="rounded-xl border border-darkBorder bg-darkBg/40 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={shippingDetails.mobile}
                    onChange={handleInputChange}
                    placeholder="10-digit number"
                    className="rounded-xl border border-darkBorder bg-darkBg/40 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Delivery Address</label>
                  <textarea
                    name="address"
                    value={shippingDetails.address}
                    onChange={handleInputChange}
                    placeholder="Street, Landmark, Apartment"
                    className="w-full min-h-[70px] rounded-xl border border-darkBorder bg-darkBg/40 px-4 py-2 text-sm text-textPrimary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  ></textarea>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingDetails.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit pincode"
                    className="rounded-xl border border-darkBorder bg-darkBg/40 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={shippingDetails.paymentMethod}
                    onChange={handleInputChange}
                    className="rounded-xl border border-darkBorder bg-darkBg/40 px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Card Payment">Credit / Debit Card</option>
                    <option value="UPI">UPI (GooglePay/PhonePe)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full rounded-xl bg-accent py-3.5 font-bold text-white shadow-lg transition-all hover:bg-accentHover hover:-translate-y-0.5 hover:shadow-accent/30 disabled:bg-accent/40 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? 'Processing...' : 'Place Secure Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
