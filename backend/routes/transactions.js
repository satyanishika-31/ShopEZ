import express from 'express';
import User from '../models/User.js';
import Stock from '../models/Stock.js';
import Transaction from '../models/Transaction.js';
import Portfolio from '../models/Portfolio.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/transactions/trade
// @desc    Execute a purchase or return
// @access  Private
router.post('/trade', protect, async (req, res) => {
  try {
    const { symbol, type, quantity } = req.body;
    const qty = Number(quantity);

    // Validate request inputs
    if (!symbol || !type || !qty || qty <= 0 || !['BUY', 'SELL'].includes(type)) {
      return res.status(400).json({ message: 'Invalid order details provided' });
    }

    // Find user and product
    const user = await User.findById(req.user.id);
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });

    if (!stock) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const price = stock.price;
    const totalAmount = Number((qty * price).toFixed(2));

    // Get or initialize user's portfolio
    let portfolio = await Portfolio.findOne({ userId: user._id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: user._id, holdings: [] });
    }

    if (type === 'BUY') {
      // Update Portfolio Holdings
      const holdingIndex = portfolio.holdings.findIndex(h => h.symbol === stock.symbol);
      if (holdingIndex >= 0) {
        const oldQty = portfolio.holdings[holdingIndex].quantity;
        const oldAvg = portfolio.holdings[holdingIndex].averageBuyPrice;
        
        // Calculate new average buy price
        const newQty = oldQty + qty;
        const newAvg = Number(((oldQty * oldAvg + qty * price) / newQty).toFixed(2));
        
        portfolio.holdings[holdingIndex].quantity = newQty;
        portfolio.holdings[holdingIndex].averageBuyPrice = newAvg;
      } else {
        portfolio.holdings.push({
          stockId: stock._id,
          symbol: stock.symbol,
          quantity: qty,
          averageBuyPrice: price
        });
      }
      await portfolio.save();

    } else if (type === 'SELL') {
      // Find the item to verify the user owns enough to return.
      const holdingIndex = portfolio.holdings.findIndex(h => h.symbol === stock.symbol);
      if (holdingIndex < 0 || portfolio.holdings[holdingIndex].quantity < qty) {
        return res.status(400).json({ message: 'Insufficient purchased quantity to complete this return' });
      }

      // Deduct quantity from holdings
      portfolio.holdings[holdingIndex].quantity -= qty;

      // If holdings quantity reaches 0, remove the holding entirely
      if (portfolio.holdings[holdingIndex].quantity === 0) {
        portfolio.holdings.splice(holdingIndex, 1);
      }
      await portfolio.save();
    }

    // Record Transaction log
    const transaction = await Transaction.create({
      userId: user._id,
      stockId: stock._id,
      symbol: stock.symbol,
      type,
      quantity: qty,
      price,
      totalAmount
    });

    if (type === 'BUY') {
      stock.volume += qty;
      await stock.save();
    }

    return res.status(201).json({
      message: `${type === 'BUY' ? 'Order' : 'Return'} for ${qty} item(s) of ${stock.symbol} confirmed successfully`,
      transaction,
      portfolio: portfolio.holdings
    });

  } catch (error) {
    console.error('Execute Order Error:', error.message);
    return res.status(500).json({ message: 'Server error during checkout' });
  }
});

// @route   GET /api/transactions/history
// @desc    Get user's order history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const history = await Transaction.find({ userId: req.user.id })
      .sort({ timestamp: -1 });
    return res.json(history);
  } catch (error) {
    console.error('Fetch Order History Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching transaction logs' });
  }
});

export default router;
