import express from 'express';
import Cart from '../models/Cart.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/cart/fetch-cart
// @desc    Fetch only logged-in user's cart items
// @access  Private
router.get('/fetch-cart', protect, async (req, res) => {
  try {
    const items = await Cart.find({ userId: req.user._id });
    res.json(items);
  } catch (err) {
    console.error('Error fetching cart:', err.message);
    res.status(500).json({ message: 'Error fetching cart items' });
  }
});

// @route   POST /api/cart/add-to-cart
// @desc    Add item to cart
// @access  Private
router.post('/add-to-cart', protect, async (req, res) => {
  const { title, description, mainImg, size, quantity, price, discount } = req.body;
  try {
    const item = new Cart({
      userId: req.user._id,
      title,
      description,
      mainImg,
      size,
      quantity: quantity || 1,
      price,
      discount
    });
    await item.save();
    res.json({ message: 'Added to cart' });
  } catch (err) {
    console.error('Error adding to cart:', err.message);
    res.status(500).json({ message: 'Error adding item to cart' });
  }
});

// @route   PUT /api/cart/increase-cart-quantity
// @desc    Increase quantity
// @access  Private
router.put('/increase-cart-quantity', protect, async (req, res) => {
  const { id } = req.body;
  try {
    const item = await Cart.findOne({ _id: id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found in your cart' });
    }
    item.quantity = parseInt(item.quantity) + 1;
    await item.save();
    res.json({ message: 'Incremented' });
  } catch (err) {
    console.error('Error increasing qty:', err.message);
    res.status(500).json({ message: 'Error updating quantity' });
  }
});

// @route   PUT /api/cart/decrease-cart-quantity
// @desc    Decrease quantity
// @access  Private
router.put('/decrease-cart-quantity', protect, async (req, res) => {
  const { id } = req.body;
  try {
    const item = await Cart.findOne({ _id: id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found in your cart' });
    }
    if (item.quantity > 1) {
      item.quantity = parseInt(item.quantity) - 1;
      await item.save();
    }
    res.json({ message: 'Decremented' });
  } catch (err) {
    console.error('Error decreasing qty:', err.message);
    res.status(500).json({ message: 'Error updating quantity' });
  }
});

// @route   DELETE /api/cart/remove-item/:id
// @desc    Remove item from cart
// @access  Private
router.delete('/remove-item/:id', protect, async (req, res) => {
  try {
    const item = await Cart.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found in your cart' });
    }
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error('Error removing item:', err.message);
    res.status(500).json({ message: 'Error removing item from cart' });
  }
});

export default router;
