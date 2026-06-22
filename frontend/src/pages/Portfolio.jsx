import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../utils/formatCurrency';

ChartJS.register(ArcElement, Tooltip, Legend);

const Portfolio = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async (isSilent = false) => {
    try {
      const res = await API.get('/portfolio');
      setData(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch orders:', err.message);
      if (!isSilent) {
        setError('Error loading order records. Check server connection.');
      }
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner-custom"></div>
      </div>
    );
  }

  const hasOrders = data && data.holdings && data.holdings.length > 0;
  const summary = data?.summary || {
    totalHoldingsValue: 0,
    totalCostBasis: 0,
    totalProfit: 0,
    totalProfitPercent: 0
  };

  const chartData = hasOrders
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
          label: function(context) {
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

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-7xl flex-col gap-8 bg-darkBg px-4 py-8 text-textPrimary md:px-8">
      <div>
        <h1 className="text-2xl font-extrabold md:text-3xl">Order History</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Review purchased items, checkout totals, and order history in INR.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-trendDown/30 bg-trendDown/10 p-4 text-sm text-trendDown">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <div className="glass-card flex flex-col gap-1 rounded-2xl border border-darkBorder p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-textMuted">Product Types</span>
          <span className="text-lg font-black text-textPrimary md:text-2xl">{data?.holdings?.length || 0}</span>
        </div>
        <div className="glass-card flex flex-col gap-1 rounded-2xl border border-darkBorder p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-textMuted">Items Value</span>
          <span className="text-lg font-black text-accent md:text-2xl">{formatCurrency(summary.totalHoldingsValue)}</span>
        </div>
        <div className="glass-card flex flex-col gap-1 rounded-2xl border border-darkBorder p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-textMuted">Value Difference</span>
          <span className={`text-lg font-black md:text-2xl ${savingsPositive ? 'text-trendUp' : 'text-trendDown'}`}>
            {summary.totalProfit >= 0 ? '+' : ''}
            {formatCurrency(summary.totalProfit)} ({summary.totalProfitPercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        {hasOrders && (
          <div className="glass-card flex flex-col gap-4 rounded-2xl border border-darkBorder p-6 lg:col-span-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary">Order Mix</h3>
            <div className="relative h-[250px] w-full">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        <div className={`${hasOrders ? 'lg:col-span-2' : 'lg:col-span-3'} glass-card overflow-hidden rounded-2xl border border-darkBorder p-0`}>
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
                {hasOrders ? (
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
                        <span>Your ShopEZ order list is empty.</span>
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
  );
};

export default Portfolio;
