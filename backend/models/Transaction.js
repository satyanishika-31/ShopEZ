import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Indexing by user for fast history lookups
  },
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
  type: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Transaction', TransactionSchema);
