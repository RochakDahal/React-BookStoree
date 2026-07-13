// backend/models/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
    },
  ],
}, { 
  timestamps: true 
});

// ✅ Index for faster queries
cartSchema.index({ user: 1 });

module.exports = mongoose.model('Cart', cartSchema);