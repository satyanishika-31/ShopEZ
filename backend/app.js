require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morganLogger = require('morgan');
const cors = require('cors');

const connectDB = require('./config/db');
const { initializeStocks } = require('./services/stockSimulator');

// Connect to MongoDB
connectDB();

// Seed initial ShopEZ product data.
initializeStocks();

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(morganLogger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static folder (if serving any assets)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/admin', require('./routes/admin'));

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

module.exports = app;
