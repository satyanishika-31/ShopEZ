import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../utils/formatCurrency';

ChartJS.register(ArcElement, Tooltip, Legend);

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('delivery');
  const [data, setData] = useState(null);
  const [physicalOrders, setPhysicalOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchHoldings = async (isSilent = false) => {
    try {
      const res = await API.get('/portfolio');
      setData(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch holdings:', err.message);
      if (!isSilent) {
        setError('Error loading virtual holdings. Check server connection.');
      }
    }
  };

  const fetchPhysicalOrders = async (isSilent = false) => {
    try {
      const res = await API.get('/orders/fetch-orders');
      setPhysicalOrders(res.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch physical orders:', err.message);
      if (!isSilent) {
        setError('Error loading physical orders. Check server connection.');
      }
    }
  };

  const loadData = async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
    }
    if (activeTab === 'delivery') {
      await fetchPhysicalOrders(isSilent);
    } else {
      await fetchHoldings(isSilent);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(false);
    // eslint-disable-next-line
  }, [activeTab]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    try {
      await API.put('/orders/cancel-order', { orderId });
      await fetchPhysicalOrders(true);
    } catch (err) {
      console.error('Cancel order failed:', err.message);
      alert(err.response?.data?.message || 'Could not cancel the order.');
    }
  };

  if (loading && !data && physicalOrders.length === 0) {
    return (
      <div className="loader-container">
        <div className="spinner-custom"></div>
      </div>
    );
  }

  const hasHoldings = data && data.holdings && data.holdings.length > 0;
  const summary = data?.summary || {
    totalHoldingsValue: 0,
    totalCostBasis: 0,
    totalProfit: 0,
    totalProfitPercent: 0
  };

  const chartData = hasHoldings
    ? {
      labels: data.holdings.map(h => h.symbol),
      datasets: [
        {
          data: data.holdings.map(h => h.currentValue),
          backgroundColor: ['#6D9891', '#F69F83', '#76575D', '#AFAC9B', '#E0C1A5', '#5F867F', '#C98A76', '#8E8474'],
          borderColor: 'rgba(118, 87, 93, 0.18)',
          borderWidth: 1.5,
          hoverOffset: 6
        }
      ]
    }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#76575D',
          font: { family: 'Outfit', size: 11 },
          boxWidth: 12,
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 250, 244, 0.96)',
        titleColor: '#76575D',
        bodyColor: '#76575D',
        borderColor: 'rgba(118, 87, 93, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const val = context.raw;
            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
            const percentage = ((val / total) * 100).toFixed(1);
            return ` ${context.label}: ${formatCurrency(val)} (${percentage}%)`;
          }
        }
      }
    }
  };

  const savingsPositive = summary.totalProfit <= 0;

  // Status badge styling helper
  const getStatusBadge = (status) => {
    const cleanStatus = status?.toLowerCase() || '';
    if (cleanStatus === 'cancelled') {
      return 'border-trendDown/30 bg-trendDown/10 text-trendDown';
    } else if (cleanStatus === 'delivered') {
      return 'border-accent/30 bg-accent/10 text-accent';
    }
    return 'border-russett/30 bg-russett/10 text-russett';
  };

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-7xl flex-col gap-6 bg-darkBg px-4 py-8 text-textPrimary md:px-8">
      <div>
        <h1 className="text-2xl font-extrabold md:text-3xl">Order Management</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Review purchased items, delivery logs, and virtual inventory details.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-6 border-b border-darkBorder/60">

        <button
          onClick={() => setActiveTab('holdings')}
          className={`border-b-2 pb-3 text-sm font-semibold transition-all ${activeTab === 'holdings'
            ? 'border-accent text-accent'
            : 'border-transparent text-textSecondary hover:text-textPrimary'
            }`}
        >
          orders details
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-trendDown/30 bg-trendDown/10 p-4 text-sm text-trendDown">
          {error}
        </div>
      )}

      {/* Delivery Orders View */}
      {activeTab === 'delivery' && (
        <div className="flex flex-col gap-6">
          {physicalOrders.length > 0 ? (
            <div className="grid gap-4">
              {physicalOrders.map((order) => (
                <div
                  key={order._id}
                  className="glass-card flex flex-col gap-4 rounded-2xl border border-darkBorder p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-darkBorder/30 pb-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-textMuted uppercase tracking-wider font-bold">Order Placed</span>
                      <span className="text-sm font-semibold">{new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-textMuted uppercase tracking-wider font-bold">Recipient</span>
                      <span className="text-sm font-semibold">{order.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-textMuted uppercase tracking-wider font-bold">Total Amount</span>
                      <span className="text-sm font-extrabold text-accent">
                        {formatCurrency(order.quantity * order.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus || 'order placed'}
                      </span>
                      {order.orderStatus?.toLowerCase() === 'order placed' && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="rounded-lg border border-trendDown/40 bg-trendDown/10 px-3 py-1 text-xs font-bold text-trendDown hover:bg-trendDown/20 transition-all"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-[100px_1fr_220px] md:items-center">
                    <div className="h-20 w-20 overflow-hidden rounded-lg border border-darkBorder bg-darkBg/60">
                      {order.mainImg ? (
                        <img src={order.mainImg} alt={order.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-accent/60">
                          ShopEZ
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-bold text-textPrimary">{order.title}</h3>
                      {order.description && (
                        <p className="text-xs text-textSecondary line-clamp-1">{order.description}</p>
                      )}
                      <div className="text-xs text-textMuted mt-1">
                        Size: <span className="font-semibold text-textSecondary">{order.size || 'One Size'}</span>
                        <span className="mx-2">•</span>
                        Qty: <span className="font-semibold text-textSecondary">{order.quantity}</span>
                        <span className="mx-2">•</span>
                        Price: <span className="font-semibold text-textSecondary">{formatCurrency(order.price)}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-darkBorder/40 bg-white/20 p-3 text-xs flex flex-col gap-1 text-textSecondary">
                      <div className="font-bold text-textPrimary text-[10px] uppercase tracking-wider mb-1">Shipping Details</div>
                      <div>Address: {order.address}</div>
                      <div>Pincode: {order.pincode}</div>
                      <div>Mobile: {order.mobile}</div>
                      <div>Payment: {order.paymentMethod}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card flex flex-col items-center gap-4 rounded-2xl border border-darkBorder py-16 text-center">
              <div className="text-5xl">📦</div>
              <div>
                <h3 className="text-lg font-bold text-textPrimary">No delivery orders found</h3>
                <p className="text-sm text-textSecondary mt-1">You haven't placed any physical shipping orders yet.</p>
              </div>
              <Link to="/markets" className="btn-primary-custom text-xs">
                Browse Products
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Virtual Inventory holdings tab */}
      {activeTab === 'holdings' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div className="glass-card flex flex-col gap-1 rounded-2xl border border-darkBorder p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-textMuted">Product Types</span>
              <span className="text-lg font-black text-textPrimary md:text-2xl">{data?.holdings?.length || 0}</span>
            </div>
            <div className="glass-card flex flex-col gap-1 rounded-2xl border border-darkBorder p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-textMuted">Items Value</span>
              <span className="text-lg font-black text-accent md:text-2xl">{formatCurrency(summary.totalHoldingsValue)}</span>
            </div>

          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            {hasHoldings && (
              <div className="glass-card flex flex-col gap-4 rounded-2xl border border-darkBorder p-6 lg:col-span-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary">Order Mix</h3>
                <div className="relative h-[250px] w-full">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              </div>
            )}

            <div className={`${hasHoldings ? 'lg:col-span-2' : 'lg:col-span-3'} glass-card overflow-hidden rounded-2xl border border-darkBorder p-0`}>
              <div className="flex items-center justify-between border-b border-darkBorder p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary">Purchased Items</h3>
                <span className="text-xs font-bold uppercase text-textMuted">{data?.holdings?.length || 0} Product Types</span>
              </div>

              <div className="overflow-x-auto">
                <table className="table-custom w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-darkBg/20">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">SKU</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-textMuted">Product</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-textMuted">Qty</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-textMuted">Avg Paid</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-textMuted">Now</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-textMuted">Order Total</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-textMuted">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hasHoldings ? (
                      data.holdings.map((holding) => (
                        <tr
                          key={holding.symbol}
                          onClick={() => navigate(`/stocks/${holding.symbol}`)}
                          className="cursor-pointer border-b border-darkBorder/40 transition-all hover:bg-white/[0.01]"
                        >
                          <td className="px-6 py-4 font-bold text-accent">{holding.symbol}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-textPrimary">{holding.name}</div>
                            <div className="text-xs text-textMuted">Seller: {holding.seller || 'ShopEZ'}</div>
                          </td>
                          <td className="px-6 py-4 text-right font-medium">{holding.quantity}</td>
                          <td className="px-6 py-4 text-right">{formatCurrency(holding.averageBuyPrice)}</td>
                          <td className="px-6 py-4 text-right font-semibold">{formatCurrency(holding.currentPrice)}</td>
                          <td className="px-6 py-4 text-right font-semibold text-textPrimary">{formatCurrency(holding.costBasis)}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/stocks/${holding.symbol}`);
                              }}
                              className="rounded-lg border border-darkBorder bg-white/5 px-3 py-1.5 text-xs font-semibold text-textPrimary transition-all hover:border-accent hover:bg-accent hover:text-white"
                            >
                              Reorder
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-16 text-center text-sm text-textSecondary">
                          <div className="flex flex-col items-center gap-3">
                            <span>Your ShopEZ virtual order list is empty.</span>
                            <Link to="/markets" className="btn-primary-custom text-xs">
                              Browse Products
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
