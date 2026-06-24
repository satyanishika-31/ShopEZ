import express from 'express';
import {
  fetchCartItems,
  addToCart,
  increaseCartQuantity,
  decreaseCartQuantity,
  removeItemFromCart
} from '../controllers/cartController.js';

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/fetch-cart', protect, fetchCartItems);
router.post('/add-to-cart', protect, addToCart);
router.put('/increase-cart-quantity', protect, increaseCartQuantity);
router.put('/decrease-cart-quantity', protect, decreaseCartQuantity);

router.delete('/remove-item/:id', protect, removeItemFromCart);
export default router;
