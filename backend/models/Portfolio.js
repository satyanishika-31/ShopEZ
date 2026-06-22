const mongoose = require('mongoose');

const HoldingSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative']
  },
  averageBuyPrice: {
    type: Number,
    required: true,
    min: [0, 'Average price cannot be negative']
  }
}, { _id: false });

const PortfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One portfolio per user
    index: true
  },
  holdings: [HoldingSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

PortfolioSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
