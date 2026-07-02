import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const BookCard = ({ book }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const inWishlist = isInWishlist(book._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(book._id);
    } else {
      addToWishlist(book._id);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book._id, 1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

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
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
      >
        <div className="relative h-80 overflow-hidden bg-gray-100">
          <motion.img
            src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
            alt={book.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          />
          
      
          <button
            onClick={handleWishlistClick}
            className={`absolute top-4 left-4 p-2 rounded-full shadow-lg transition-all z-10 ${
              inWishlist 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-white' : ''}`} />
          </button>

          
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
            {renderStars(book.rating || 4.5)}
            <span className="text-sm font-semibold text-gray-700 ml-1">
              {book.rating ? book.rating.toFixed(1) : 'N/A'}
            </span>
          </div>

        
          {book.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{book.title}</h3>
          <p className="text-teal-600 font-medium mb-2">by {book.author}</p>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{book.description}</p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">Rs. {book.price.toFixed(2)}</span>
              {book.stock > 0 && book.stock < 10 && (
                <p className="text-xs text-orange-600 mt-1">Only {book.stock} left!</p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={book.stock === 0}
              className={`p-3 rounded-lg flex items-center gap-2 transition-all ${
                book.stock === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default BookCard;