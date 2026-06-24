import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  banner: {
    type: String,
    default: ''
  },
  categories: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default mongoose.model('Admin', AdminSchema);
