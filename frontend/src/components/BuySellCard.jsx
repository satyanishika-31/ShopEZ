import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { formatCurrency } from '../utils/formatCurrency';

const BuySellCard = ({ stock, ownedQuantity = 0, onTradeSuccess }) => {
  const [orderType, setOrderType] = useState('BUY');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    setMessage({ text: '', type: '' });
    setQuantity('1');
    setOrderType('BUY');
  }, [stock]);

  const currentPrice = stock.price;
  const totalCost = (parseInt(quantity) || 0) * currentPrice;

  const handleCheckout = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setMessage({ text: 'Please enter a valid quantity.', type: 'error' });
      return;
    }

    if (orderType === 'SELL' && ownedQuantity < qty) {
      setMessage({ text: 'You do not have enough items to return.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await API.post('/transactions/trade', {
        symbol: stock.symbol,
        type: orderType,
        quantity: qty
      });

      setMessage({
        text: res.data.message || 'Order confirmed instantly.',
        type: 'success'
      });
      setQuantity('1');

      if (onTradeSuccess) {
        onTradeSuccess();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Checkout failed.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card flex flex-col gap-5 rounded-2xl border border-darkBorder p-6">
      <div>
        <h3 className="text-lg font-bold text-textPrimary">Secure Checkout</h3>
        <p className="text-xs text-textMuted">Instant confirmation for approved seller products</p>
      </div>

      <div className="grid grid-cols-2 rounded-xl border border-darkBorder bg-darkBg/60 p-1">
        <button
          onClick={() => {
            setOrderType('BUY');
            setMessage({ text: '', type: '' });
          }}
          className={`rounded-lg py-2 text-sm font-semibold transition-all ${
            orderType === 'BUY'
              ? 'bg-trendUp text-white shadow-lg'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => {
            setOrderType('SELL');
            setMessage({ text: '', type: '' });
          }}
          className={`rounded-lg py-2 text-sm font-semibold transition-all ${
            orderType === 'SELL'
              ? 'bg-trendDown text-white shadow-lg'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          Return
        </button>
      </div>

      <form onSubmit={handleCheckout} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
            Quantity
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="no-spinner w-full rounded-xl border border-darkBorder bg-darkBg/40 pl-4 pr-16 py-3 font-medium text-textPrimary outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent"
              required
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase text-textMuted">
              Items
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-darkBorder/40 bg-darkBg/30 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-textSecondary">Unit Price:</span>
            <span className="font-semibold text-textPrimary">{formatCurrency(currentPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-textSecondary">Purchased:</span>
            <span className="font-semibold text-accent">{ownedQuantity}</span>
          </div>
          <hr className="my-1 border-darkBorder" />
          <div className="flex justify-between text-base font-bold">
            <span className="text-textPrimary">Order Total:</span>
            <span className={orderType === 'BUY' ? 'text-trendUp' : 'text-trendDown'}>
              {formatCurrency(totalCost)}
            </span>
          </div>
        </div>

        {message.text && (
          <div
            className={`rounded-xl border p-3 text-xs ${
              message.type === 'success'
                ? 'border-trendUp/30 bg-trendUp/10 text-trendUp'
                : 'border-trendDown/30 bg-trendDown/10 text-trendDown'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl py-3 font-bold text-white shadow-lg transition-all ${
            loading
              ? 'cursor-not-allowed bg-accent/50'
              : orderType === 'BUY'
              ? 'bg-trendUp hover:-translate-y-0.5 hover:bg-trendUp/90 hover:shadow-[0_0_15px_rgba(109,152,145,0.32)]'
              : 'bg-trendDown hover:-translate-y-0.5 hover:bg-trendDown/90 hover:shadow-[0_0_15px_rgba(246,159,131,0.34)]'
          }`}
        >
          {loading ? 'Processing...' : orderType === 'BUY' ? `Buy ${stock.symbol}` : `Return ${stock.symbol}`}
        </button>
      </form>
    </div>
  );
};

export default BuySellCard;
