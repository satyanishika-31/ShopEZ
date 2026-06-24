import express from 'express';
import Stock from '../models/Stock.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/stocks
// @desc    Get all listed products (supports filtering/searching by SKU/name/category)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { symbol: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const stocks = await Stock.find(query)
      .populate('sellerId', 'username email')
      .select('-historicalData');
    return res.json(stocks);
  } catch (error) {
    console.error('Fetch Products Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching products' });
  }
});

// @route   GET /api/stocks/:symbol
// @desc    Get detailed product data including price history
// @access  Private
router.get('/:symbol', protect, async (req, res) => {
  try {
    const stock = await Stock.findOne({
      symbol: req.params.symbol.toUpperCase()
    }).populate('sellerId', 'username email');
    
    if (!stock) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(stock);
  } catch (error) {
    console.error('Fetch Product Detail Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching product details' });
  }
});

// @route   POST /api/stocks/:symbol/comments
// @desc    Add a comment to a product (Only users can comment)
// @access  Private
router.post('/:symbol/comments', protect, async (req, res) => {
  if (req.user.role !== 'USER') {
    return res.status(403).json({ message: 'Only users can post comments on products' });
  }

  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ message: 'Product not found' });
    }

    stock.comments.push({
      userId: req.user._id,
      username: req.user.username,
      text: text.trim(),
      createdAt: new Date()
    });

    await stock.save();
    return res.status(201).json(stock.comments);
  } catch (error) {
    console.error('Add Comment Error:', error.message);
    return res.status(500).json({ message: 'Server error posting comment' });
  }
});

export default router;
