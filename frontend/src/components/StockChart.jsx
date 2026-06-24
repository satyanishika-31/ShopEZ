import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockChart = ({ history = [], symbol, changePercent }) => {
  // Sort history ascendingly by date just in case
  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Formats for Chart labels (hours or dates)
  const labels = sortedHistory.map(item => {
    const d = new Date(item.date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const prices = sortedHistory.map(item => item.price);
  
  // Choose palette color based on daily price movement direction
  const isUp = changePercent >= 0;
  const strokeColor = isUp ? '#6D9891' : '#F69F83';
  const fillColor = isUp ? 'rgba(109, 152, 145, 0.16)' : 'rgba(246, 159, 131, 0.18)';

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: `${symbol} Price (INR)`,
        data: prices,
        borderColor: strokeColor,
        backgroundColor: fillColor,
        borderWidth: 2,
        pointRadius: 1.5,
        pointHoverRadius: 5,
        pointBackgroundColor: strokeColor,
        tension: 0.2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 250, 244, 0.96)',
        titleColor: '#76575D',
        bodyColor: '#76575D',
        borderColor: 'rgba(118, 87, 93, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR'
            }).format(context.raw);
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)'
        },
        ticks: {
          color: '#8E8474',
          maxTicksLimit: 8,
          font: {
            size: 10,
            family: 'Outfit'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)'
        },
        ticks: {
          color: '#8E8474',
          font: {
            size: 10,
            family: 'Outfit'
          },
          callback: function(value) {
            return new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0
            }).format(value);
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Line data={data} options={options} />
    </div>
  );
};

export default StockChart;
