import express from 'express';
import {
  fetchProducts,
  fetchProductDetails,
  addNewProduct,
  updateProduct,
  fetchCategories
} from '../controllers/productController.js';

import { protect } from '../middleware/authMiddleware.js'; // import auth middleware
import { buyProduct } from '../controllers/productController.js';

// Protected route: user must be logged in to buy


const router = express.Router();

// Public routes
router.get('/fetch-products', fetchProducts);
router.get('/fetch-product-details/:id', fetchProductDetails);
router.get('/fetch-categories', fetchCategories);

// Protected routes (require login)
router.post('/add-new-product', protect, addNewProduct);
router.put('/update-product/:id', protect, updateProduct);

export default router;
