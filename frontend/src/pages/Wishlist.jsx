// src/pages/Wishlist.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BookOpen, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';

const Wishlist = () => {
  // ✅ Destructure with default empty array
  const { wishlist = [], loading, fetchWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // ✅ Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login to View Wishlist</h2>
          <p className="text-gray-600 mb-6">Please login to see your saved books</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Login Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // ✅ Empty wishlist - FIXED: This is safe because wishlist is always an array
  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 bg-linear-to-r from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Heart className="w-12 h-12 text-red-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
          <p className="text-gray-600 mb-6">
            Start adding your favorite books to your wishlist!
          </p>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Browse Books
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // ✅ Wishlist with books
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              My Wishlist
            </h1>
            <p className="text-gray-600 mt-1">
              {wishlist.length} {wishlist.length === 1 ? 'book' : 'books'} saved
            </p>
          </div>
          <Link
            to="/books"
            className="text-teal-500 hover:text-teal-600 font-medium flex items-center gap-1"
          >
            Browse More Books
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Books Grid */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            {wishlist.map((book, index) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <BookCard book={book} index={index} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wishlist;