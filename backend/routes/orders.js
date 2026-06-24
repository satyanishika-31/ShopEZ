import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Stock from '../models/Stock.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to increment stock/product volume on successful buy
const incrementStockVolume = async (title, qty) => {
  try {
    const stock = await Stock.findOne({ name: title });
    if (stock) {
      stock.volume = (stock.volume || 0) + parseInt(qty);
      await stock.save();
    }
  } catch (error) {
    console.error('Failed to increment volume:', error.message);
  }
};

// @route   GET /api/orders/fetch-orders
// @desc    Fetch user's orders (or all if admin)
// @access  Private
router.get('/fetch-orders', protect, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'ADMIN') {
      orders = await Order.find().sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// @route   POST /api/orders/buy-product
// @desc    Order a single item directly
// @access  Private
router.post('/buy-product', protect, async (req, res) => {
  const {
    name,
    email,
    mobile,
    address,
    pincode,
    title,
    description,
    mainImg,
    size,
    quantity,
    price,
    discount,
    paymentMethod,
    orderDate
  } = req.body;

  try {
    const newOrder = new Order({
      userId: req.user._id,
      name,
      email,
      mobile,
      address,
      pincode,
      title,
      description,
      mainImg,
      size,
      quantity: quantity || 1,
      price,
      discount,
      paymentMethod,
      orderDate: orderDate || new Date()
    });
    await newOrder.save();
    await incrementStockVolume(title, quantity || 1);

    res.json({ message: 'Order placed' });
  } catch (err) {
    console.error('Error buying product:', err.message);
    res.status(500).json({ message: 'Error placing order' });
  }
});

// @route   PUT /api/orders/cancel-order
// @desc    Cancel order (set status to Cancelled)
// @access  Private
router.put('/cancel-order', protect, async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Optional: verification if order belongs to user or is admin
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling order:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/place-cart-order
// @desc    Place order from all cart items and clear cart
// @access  Private
router.post('/place-cart-order', protect, async (req, res) => {
  const { name, mobile, email, address, pincode, paymentMethod, orderDate } = req.body;

  try {
    const cartItems = await Cart.find({ userId: req.user._id });
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    await Promise.all(
      cartItems.map(async (item) => {
        const newOrder = new Order({
          userId: req.user._id,
          name,
          email,
          mobile,
          address,
          pincode,
          title: item.title,
          description: item.description,
          mainImg: item.mainImg,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          paymentMethod,
          orderDate: orderDate || new Date()
        });

        await newOrder.save();
        await incrementStockVolume(item.title, item.quantity);
        await Cart.deleteOne({ _id: item._id });
      })
    );

    res.json({ message: 'Order placed' });
  } catch (err) {
    console.error('Error placing cart order:', err.message);
    res.status(500).json({ message: 'Error placing cart order' });
  }
});

// @route   PUT /api/orders/update-order-status
// @desc    Update order status (Admin only)
// @access  Private
router.put('/update-order-status', protect, async (req, res) => {
  const { id, updateStatus } = req.body;
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = updateStatus;
    await order.save();

    res.json({ message: 'Order status updated' });
  } catch (err) {
    console.error('Error updating order status:', err.message);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

export default router;
