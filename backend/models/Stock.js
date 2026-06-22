const mongoose = require('mongoose');

const HistoricalDataSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const StockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Please add a symbol'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true // Optimized index for fast querying
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    trim: true,
    default: ''
  },
  change: {
    type: Number,
    default: 0.0
  },
  changePercent: {
    type: Number,
    default: 0.0
  },
  high: {
    type: Number,
    required: true
  },
  low: {
    type: Number,
    required: true
  },
  open: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    default: 0
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  reviewStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED'],
    default: 'APPROVED'
  },
  historicalData: [HistoricalDataSchema],
  comments: {
    type: [CommentSchema],
    default: []
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
StockSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Stock', StockSchema);
