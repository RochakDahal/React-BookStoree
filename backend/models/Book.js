// backend/models/Book.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    index: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  coverImage: {
    type: String,
    required: [true, 'Cover image is required'],
    trim: true
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    index: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  publishedYear: {
    type: Number,
    min: 1000,
    max: new Date().getFullYear()
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1']
  },
  publisher: {
    type: String,
    trim: true
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  previousDiscount: {
    type: Number,
    default: 0,
    min: [0, 'Previous discount cannot be negative'],
    max: [100, 'Previous discount cannot exceed 100%']
  },
  reviews: [reviewSchema]
}, {
  timestamps: true
});

// Virtual field for discounted price
bookSchema.virtual('discountedPrice').get(function() {
  if (this.discount && this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Virtual field for savings amount
bookSchema.virtual('savings').get(function() {
  if (this.discount && this.discount > 0) {
    return this.price * this.discount / 100;
  }
  return 0;
});

// Ensure virtuals are included in JSON output
bookSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.discountedPrice = doc.discountedPrice;
    ret.savings = doc.savings;
    return ret;
  }
});

// Index for better search performance
bookSchema.index({ title: 'text', author: 'text', genre: 'text' });

module.exports = mongoose.model('Book', bookSchema);