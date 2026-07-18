// backend/controllers/cartController.js
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// ✅ @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.bookId');
    
    if (!cart) {
      cart = await Cart.create({ 
        user: req.user.id, 
        items: [] 
      });
    }

    // Calculate total
    let total = 0;
    cart.items.forEach(item => {
      const price = item.price || item.bookId?.price || 0;
      total += price * item.quantity;
    });

    res.json({
      success: true,
      items: cart.items,
      total
    });
  } catch (error) {
    console.error('❌ Get cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ✅ @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    
    // Get book with discount
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }

    if (book.stock < quantity) {
      return res.status(400).json({ 
        success: false,
        message: `Only ${book.stock} items available` 
      });
    }

    // Calculate discounted price
    const hasDiscount = book.discount && book.discount > 0;
    const priceToUse = hasDiscount 
      ? book.price - (book.price * book.discount / 100) 
      : book.price;

    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = await Cart.create({ 
        user: req.user.id, 
        items: [] 
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.bookId.toString() === bookId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = priceToUse;
      cart.items[existingItemIndex].discount = book.discount || 0;
      cart.items[existingItemIndex].title = book.title;
      cart.items[existingItemIndex].coverImage = book.coverImage;
    } else {
      // Add new item
      cart.items.push({
        bookId: book._id,
        quantity: quantity,
        price: priceToUse,
        discount: book.discount || 0,
        title: book.title,
        coverImage: book.coverImage
      });
    }

    // Reduce stock
    book.stock -= quantity;
    await book.save();

    await cart.save();
    await cart.populate('items.bookId');

    res.json({
      success: true,
      items: cart.items
    });
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ✅ @desc    Update cart item quantity
// @route   PUT /api/cart
// @access  Private
exports.updateCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;

    if (!bookId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Book ID and quantity are required'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.bookId.toString() === bookId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found in cart' 
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      const book = await Book.findById(bookId);
      if (book && book.stock < quantity) {
        return res.status(400).json({ 
          success: false,
          message: `Only ${book.stock} items available` 
        });
      }
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.bookId');

    res.json({
      success: true,
      items: cart.items
    });
  } catch (error) {
    console.error('❌ Update cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ✅ @desc    Remove item from cart
// @route   DELETE /api/cart/:bookId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    // Filter out the item
    cart.items = cart.items.filter(
      item => item.bookId.toString() !== bookId
    );

    await cart.save();
    await cart.populate('items.bookId');

    res.json({
      success: true,
      items: cart.items
    });
  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ✅ @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      items: []
    });
  } catch (error) {
    console.error('❌ Clear cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};