import express from 'express';
import { registerUser, loginUser, fetchUsers } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route
router.get('/fetch-users', protect, fetchUsers);

export default router;
