import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Stock from './models/Stock.js';

// Route imports
import authRoutes from './routes/auth.js';
import stocksRoutes from './routes/stocks.js';
import transactionsRoutes from './routes/transactions.js';
import portfolioRoutes from './routes/portfolio.js';
import adminRoutes from './routes/admin.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6001;

// Database Connection
connectDB().then(() => {
  seedInitialData();
});

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);

// Catch-all 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API Endpoint not found' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Seed function to ensure the app has catalog data out-of-the-box
async function seedInitialData() {
  try {
    const count = await Stock.countDocuments();
    if (count === 0) {
      console.log('Seeding initial products/stocks into database...');
      
      const seedProducts = [
        {
          symbol: 'SL-LAMP',
          name: 'Smart LED Desk Lamp',
          price: 2499,
          open: 2499,
          high: 2499,
          low: 2499,
          imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=300',
          category: 'Smart Living',
          description: 'A sleek desk lamp with adjustable color temperatures, brightness controls, and smart home integration.',
          sizes: ['One Size'],
          carousel: [
            'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=300'
          ],
          historicalData: [{ date: new Date(), price: 2499 }]
        },
        {
          symbol: 'WE-CHAIR',
          name: 'Ergonomic Office Chair',
          price: 8999,
          open: 8999,
          high: 8999,
          low: 8999,
          imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300',
          category: 'Work Essentials',
          description: 'High-back office chair with custom lumbar support, 3D armrests, and synchronized tilt mechanism.',
          sizes: ['Standard', 'XL'],
          carousel: [
            'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=300'
          ],
          historicalData: [{ date: new Date(), price: 8999 }]
        },
        {
          symbol: 'HC-BLANKET',
          name: 'Weighted Comfort Blanket',
          price: 3999,
          open: 3999,
          high: 3999,
          low: 3999,
          imageUrl: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?q=80&w=300',
          category: 'Home Comfort',
          description: 'Premium weighted blanket filled with fine glass micro-beads to reduce stress and improve sleep.',
          sizes: ['Double (5kg)', 'King (7kg)'],
          carousel: [
            'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?q=80&w=300'
          ],
          historicalData: [{ date: new Date(), price: 3999 }]
        },
        {
          symbol: 'DD-HEADSET',
          name: 'Noise Cancelling Headset',
          price: 5999,
          open: 5999,
          high: 5999,
          low: 5999,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300',
          category: 'Daily Deals',
          description: 'Active noise-cancelling over-ear headphones with 40-hour battery life and quick charge capability.',
          sizes: ['One Size'],
          carousel: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300'
          ],
          historicalData: [{ date: new Date(), price: 5999 }]
        }
      ];

      await Stock.insertMany(seedProducts);
      console.log('Seeding completed successfully!');
    }
  } catch (err) {
    console.error('Error seeding products:', err.message);
  }
}

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export default app;
