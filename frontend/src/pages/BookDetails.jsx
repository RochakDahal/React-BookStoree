// src/pages/BookDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, ShoppingCart, Heart, ArrowLeft, 
  Minus, Plus, BookOpen, User, Calendar, 
  FileText, Tag, CheckCircle, AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/books/${id}`);
      const bookData = response.data.book;
      console.log('📚 Book data:', bookData); // Debug log
      setBook(bookData);
      if (bookData && isInWishlist(id)) {
        setAddedToWishlist(true);
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to your cart');
      navigate('/login');
      return;
    }

    if (!book || book.stock === 0) {
      alert('This book is out of stock');
      return;
    }

    setAddingToCart(true);
    try {
      // ✅ Send discounted price to cart
      const result = await addToCart(book._id, quantity);
      if (result && result.success) {
        alert(`✅ ${book.title} added to cart!`);
      } else {
        alert(result?.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to your wishlist');
      navigate('/login');
      return;
    }

    if (!book) return;

    try {
      if (addedToWishlist) {
        await removeFromWishlist(book._id);
        setAddedToWishlist(false);
      } else {
        await addToWishlist(book._id);
        setAddedToWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  // ✅ Calculate discount details
  const hasDiscount = book?.discount && book.discount > 0;
  const price = book?.price || 0;
  const discountedPrice = hasDiscount ? price - (price * book.discount / 100) : price;
  const savings = hasDiscount ? price - discountedPrice : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error || 'Book not found'}</p>
          <Link to="/books" className="mt-4 inline-block text-teal-500 hover:underline">
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Book Cover */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=900&fit=crop'}
                alt={book.title}
                className="w-full h-auto object-cover"
              />
              {/* ✅ Discount Badge */}
              {hasDiscount && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-linear-to-r from-red-600 to-red-500 text-white px-6 py-4 rounded-xl shadow-2xl text-center">
                    <div className="text-3xl font-bold">{book.discount}%</div>
                    <div className="text-xs uppercase tracking-wider">OFF</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Book Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-teal-600">by {book.author}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(book.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : i < (book.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400 opacity-50'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {book.rating ? book.rating.toFixed(1) : 'N/A'} ({book.reviews?.length || 0} reviews)
              </span>
            </div>

            {/* ✅ Price with Discount */}
            <div className="bg-gray-50 rounded-xl p-6">
              {hasDiscount ? (
                <div>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-teal-600">
                      Rs. {discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-2xl text-gray-400 line-through">
                      Rs. {book.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                      Save Rs. {savings.toFixed(2)} ({book.discount}%)
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-4xl font-bold text-gray-900">
                  Rs. {book.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {book.stock > 0 ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">In Stock ({book.stock} available)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {book.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">Max {book.stock}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={book.stock === 0 || addingToCart}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
                  book.stock === 0 || addingToCart
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-linear-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all border-2 ${
                  addedToWishlist
                    ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${addedToWishlist ? 'fill-white' : ''}`} />
                {addedToWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Book Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>Genre: {book.genre || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Published: {book.publishedYear || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>Pages: {book.pages || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Publisher: {book.publisher || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;