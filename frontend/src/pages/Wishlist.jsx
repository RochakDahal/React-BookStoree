import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Wishlist = () => {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) return <LoadingSpinner fullScreen />;

  const handleMoveToCart = (book) => {
    addToCart(book._id, 1);
    removeFromWishlist(book._id);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-teal-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3"
        >
          <Heart className="w-10 h-10 text-red-500 fill-red-500" />
          My Wishlist
        </motion.h1>

        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-2xl shadow-lg"
          >
            <Heart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save books you love for later!</p>
            <Link to="/books" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
              Browse Books
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {wishlistItems.map((book) => (
                <motion.div
                  key={book._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <Link to={`/books/${book._id}`}>
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      <img
                        src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
                        alt={book.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  <div className="p-5">
                    <Link to={`/books/${book._id}`}>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 hover:text-teal-600 transition-colors">
                        {book.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-3">by {book.author}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-4">Rs. {book.price.toFixed(2)}</p>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMoveToCart(book)}
                        className="flex-1 bg-linear-to-r from-teal-500 to-cyan-500 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-teal-600 hover:to-cyan-600 transition-all"
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeFromWishlist(book._id)}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;