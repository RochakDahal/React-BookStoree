const express = require('express');
const router = express.Router();
const { getCart, clearCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.delete('/clear', protect, clearCart);
router.put('/:bookId', protect, updateCartItem);
router.delete('/:bookId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

module.exports = router;