import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  mainImg: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('Cart', CartSchema);
