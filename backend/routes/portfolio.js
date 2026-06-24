import express from 'express';
import User from '../models/User.js';
import Stock from '../models/Stock.js';
import Portfolio from '../models/Portfolio.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/portfolio
// @desc    Get user's purchased items with current calculations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let portfolio = await Portfolio.findOne({ userId: user._id });

    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: user._id, holdings: [] });
    }

    const calculatedHoldings = [];
    let totalHoldingsValue = 0;
    let totalCostBasis = 0;

    // Fetch the latest product prices for all purchased items.
    for (const holding of portfolio.holdings) {
      const stock = await Stock.findOne({ symbol: holding.symbol }).populate('sellerId', 'username email');
      
      if (stock) {
        const currentPrice = stock.price;
        const name = stock.name;
        const changePercent = stock.changePercent;
        const currentValue = Number((holding.quantity * currentPrice).toFixed(2));
        const costBasis = Number((holding.quantity * holding.averageBuyPrice).toFixed(2));
        const profit = Number((currentValue - costBasis).toFixed(2));
        const profitPercent = costBasis > 0 ? Number(((profit / costBasis) * 100).toFixed(2)) : 0;

        totalHoldingsValue += currentValue;
        totalCostBasis += costBasis;

        calculatedHoldings.push({
          symbol: holding.symbol,
          name,
          seller: stock.sellerId?.username || 'ShopEZ',
          quantity: holding.quantity,
          averageBuyPrice: holding.averageBuyPrice,
          currentPrice,
          changePercent,
          costBasis,
          currentValue,
          profit,
          profitPercent
        });
      } else {
        // Fallback if stock symbol is not found in database anymore
        const currentValue = Number((holding.quantity * holding.averageBuyPrice).toFixed(2));
        const costBasis = currentValue;
        
        totalHoldingsValue += currentValue;
        totalCostBasis += costBasis;

        calculatedHoldings.push({
          symbol: holding.symbol,
          name: 'Unknown Product',
          quantity: holding.quantity,
          averageBuyPrice: holding.averageBuyPrice,
          currentPrice: holding.averageBuyPrice,
          changePercent: 0,
          costBasis,
          currentValue,
          profit: 0,
          profitPercent: 0
        });
      }
    }

    // Totals calculations
    const totalProfit = Number((totalHoldingsValue - totalCostBasis).toFixed(2));
    const totalProfitPercent = totalCostBasis > 0 ? Number(((totalProfit / totalCostBasis) * 100).toFixed(2)) : 0;
    return res.json({
      summary: {
        totalHoldingsValue: Number(totalHoldingsValue.toFixed(2)),
        totalCostBasis: Number(totalCostBasis.toFixed(2)),
        totalProfit,
        totalProfitPercent
      },
      holdings: calculatedHoldings
    });

  } catch (error) {
    console.error('Fetch Orders Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching order details' });
  }
});

export default router;
