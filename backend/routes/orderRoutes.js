import express from 'express';
import {
  fetchOrders,
  buyProduct,
  cancelOrder,
  updateOrderStatus,
  placeCartOrder
} from '../controllers/orderController.js';

import { protect } from '../middleware/authMiddleware.js'; // ✅ Import JWT middlewares

const router = express.Router();

// ✅ Only logged-in users can access their orders
router.get('/fetch-orders', protect, fetchOrders);

// ✅ User actions (must be logged in)
router.post('/buy-product', protect, buyProduct);
router.put('/cancel-order', protect, cancelOrder);
router.post('/place-cart-order', protect, placeCartOrder);

// ✅ Only admin can update order status
router.put('/update-order-status', protect,  updateOrderStatus);

export default router;
