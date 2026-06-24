import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
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
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date
  },
  orderStatus: {
    type: String,
    default: 'order placed'
  }
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
