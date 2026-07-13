// src/components/BookCard.jsx
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const BookCard = ({ book, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  // ✅ Safe check - book might be undefined
  if (!book) return null;
  
  const inWishlist = isInWishlist(book._id);

  // ✅ Handle Add to Cart
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please login to add items to your cart');
      navigate('/login');
      return;
    }

    if (book.stock === 0) {
      alert('This book is out of stock');
      return;
    }

    if (addingToCart) return;
    setAddingToCart(true);

    try {
      const result = await addToCart(book._id, 1);
      
      if (result && result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        alert(result?.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // ✅ Handle Wishlist
  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please login to add items to your wishlist');
      navigate('/login');
      return;
    }
    
    try {
      if (inWishlist) {
        await removeFromWishlist(book._id);
      } else {
        await addToWishlist(book._id);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  // ✅ Render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 text-yellow-400 fill-yellow-400 opacity-50" />);
    }
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  };

  return (
    <Link to={`/books/${book._id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col relative"
      >
        {/* Success Toast */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-20 bg-green-500 text-white text-center py-2 text-sm font-medium"
          >
            ✅ Added to cart!
          </motion.div>
        )}

        {/* Book Cover */}
        <div className="relative h-56 sm:h-64 overflow-hidden bg-gray-100 shrink-0">
          <motion.img
            src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
            alt={book.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className={`absolute top-3 left-3 p-2 rounded-full shadow-lg transition-all z-10 ${
              inWishlist 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
          </button>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <div className="flex">{renderStars(book.rating || 0)}</div>
            <span className="text-xs font-semibold text-gray-700 ml-0.5">
              {book.rating ? book.rating.toFixed(1) : 'N/A'}
            </span>
          </div>

          {/* Out of Stock Badge */}
          {book.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{book.title}</h3>
          <p className="text-teal-600 text-sm font-medium mb-2">by {book.author}</p>
          <p className="text-gray-600 text-xs mb-3 line-clamp-2 flex-1">{book.description}</p>
          
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
            <div>
              <span className="text-xl font-bold text-gray-900">Rs. {book.price.toFixed(2)}</span>
              {book.stock > 0 && book.stock < 10 && (
                <p className="text-xs text-orange-600">Only {book.stock} left!</p>
              )}
            </div>
            
            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={book.stock === 0 || addingToCart}
              className={`p-2.5 rounded-lg transition-all flex items-center gap-1 ${
                book.stock === 0 || addingToCart
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-linear-to-r from-teal-500 to-cyan-500 hover:shadow-lg text-white'
              }`}
            >
              {addingToCart ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-xs font-medium hidden sm:inline">Add</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default BookCard;