import express from 'express';
import User from '../models/User.js';
import Stock from '../models/Stock.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';
import { admin, sellerOrAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/admin/users
// @desc    Get all users in system (Admin only)
// @access  Private/Admin
router.get('/users', admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error('Admin Fetch Users Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving users list' });
  }
});

// @route   GET /api/admin/transactions
// @desc    Get all transactions in the system (Admin only)
// @access  Private/Admin
router.get('/transactions', admin, async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('userId', 'username email')
      .sort({ timestamp: -1 });
    return res.json(transactions);
  } catch (error) {
    console.error('Admin Fetch Transactions Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving system transactions' });
  }
});

// @route   GET /api/admin/stocks
// @desc    Get seller inventory or all listings for admin review
// @access  Private/Seller/Admin
router.get('/stocks', sellerOrAdmin, async (req, res) => {
  try {
    const query = req.user.role === 'SELLER' ? { sellerId: req.user._id } : {};
    const stocks = await Stock.find(query)
      .populate('sellerId', 'username email')
      .select('-historicalData')
      .sort({ updatedAt: -1 });
    return res.json(stocks);
  } catch (error) {
    console.error('Admin Fetch Products Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving product listings' });
  }
});

// @route   POST /api/admin/stocks
// @desc    List a new product (Seller only)
// @access  Private/Seller
router.post('/stocks', sellerOrAdmin, async (req, res) => {
  if (req.user.role !== 'SELLER') {
    return res.status(403).json({ message: 'Only sellers can add new products' });
  }

  try {
    const { symbol, name, price, imageUrl, category } = req.body;
    const stockPrice = Number(price);

    // Validation
    if (!symbol || !name || !stockPrice || stockPrice <= 0) {
      return res.status(400).json({ message: 'Please provide valid product details' });
    }

    const symbolUpper = symbol.toUpperCase();
    const stockExists = await Stock.findOne({ symbol: symbolUpper });
    if (stockExists) {
      return res.status(400).json({ message: `Product with SKU ${symbolUpper} already exists` });
    }

    const initialHistory = [
      { date: new Date(), price: stockPrice }
    ];

    const stock = await Stock.create({
      symbol: symbolUpper,
      name,
      price: stockPrice,
      imageUrl: imageUrl || '',
      open: stockPrice,
      high: stockPrice,
      low: stockPrice,
      volume: 0,
      sellerId: req.user._id,
      reviewStatus: 'APPROVED',
      historicalData: initialHistory,
      category: category || ''
    });

    return res.status(201).json({ message: `Product ${symbolUpper} created successfully`, stock });
  } catch (error) {
    console.error('Seller Create Product Error:', error.message);
    return res.status(500).json({ message: 'Server error creating product listing' });
  }
});

// @route   PUT /api/admin/stocks/:symbol
// @desc    Update product details (Seller only, own inventory)
// @access  Private/Seller
router.put('/stocks/:symbol', sellerOrAdmin, async (req, res) => {
  if (req.user.role !== 'SELLER') {
    return res.status(403).json({ message: 'Only sellers can manage inventory' });
  }

  try {
    const { name, price, imageUrl, category } = req.body;
    const stock = await Stock.findOne({
      symbol: req.params.symbol.toUpperCase(),
      sellerId: req.user._id
    });

    if (!stock) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name) stock.name = name;
    if (category !== undefined) stock.category = category;
    stock.imageUrl = imageUrl || '';
    if (price && Number(price) > 0) {
      const newPrice = Number(price);
      
      // Update high and low relative to new price
      stock.high = newPrice > stock.high ? newPrice : stock.high;
      stock.low = newPrice < stock.low ? newPrice : stock.low;
      stock.change = Number((newPrice - stock.open).toFixed(2));
      stock.changePercent = Number(((stock.change / stock.open) * 100).toFixed(2));
      stock.price = newPrice;
      
      stock.historicalData = [{ date: new Date(), price: newPrice }];
    }

    stock.reviewStatus = 'PENDING';
    await stock.save();
    return res.json({ message: `Product ${stock.symbol} updated successfully`, stock });
  } catch (error) {
    console.error('Seller Update Product Error:', error.message);
    return res.status(500).json({ message: 'Server error updating product details' });
  }
});

// @route   PATCH /api/admin/stocks/:symbol/review
// @desc    Approve or mark a product pending after admin review
// @access  Private/Admin
router.patch('/stocks/:symbol/review', admin, async (req, res) => {
  try {
    const { reviewStatus } = req.body;
    if (!['PENDING', 'APPROVED'].includes(reviewStatus)) {
      return res.status(400).json({ message: 'Invalid review status' });
    }

    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ message: 'Product not found' });
    }

    stock.reviewStatus = reviewStatus;
    await stock.save();
    return res.json({ message: `Product ${stock.symbol} marked ${reviewStatus.toLowerCase()}`, stock });
  } catch (error) {
    console.error('Admin Review Product Error:', error.message);
    return res.status(500).json({ message: 'Server error reviewing product listing' });
  }
});

// @route   DELETE /api/admin/stocks/:symbol
// @desc    Delete a product listing (Seller only, own inventory)
// @access  Private/Seller
router.delete('/stocks/:symbol', sellerOrAdmin, async (req, res) => {
  if (req.user.role !== 'SELLER') {
    return res.status(403).json({ message: 'Only sellers can manage inventory' });
  }

  try {
    const symbolUpper = req.params.symbol.toUpperCase();
    const result = await Stock.deleteOne({ symbol: symbolUpper, sellerId: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ message: `Product ${symbolUpper} deleted successfully` });
  } catch (error) {
    console.error('Seller Delete Product Error:', error.message);
    return res.status(500).json({ message: 'Server error deleting product listing' });
  }
});

export default router;
