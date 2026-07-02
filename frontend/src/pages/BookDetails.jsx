import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, ArrowLeft, Star, Truck, Shield } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import LoadingSpinner from '../components/LoadingSpinner';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    fetchBook();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/books/${id}`);
      setBook(res.data.book);
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!book) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-2xl text-gray-500">Book not found</p>
    </div>
  );

  const inWishlist = isInWishlist(book._id);

  const handleWishlistToggle = () => {
    if (inWishlist) removeFromWishlist(book._id);
    else addToWishlist(book._id);
  };

  const handleAddToCart = () => {
    addToCart(book._id, quantity);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-teal-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
   
        <Link to="/books" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Books
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="sticky top-24"
          >
            <div className="relative group">
              
              <div className="absolute -inset-4 bg-linear-to-r from-teal-500 to-cyan-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              <motion.img
                src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=1000&fit=crop'}
                alt={book.title}
                className="relative w-full max-w-md mx-auto rounded-2xl shadow-2xl object-cover aspect-2/3"
                whileHover={{ scale: 1.03, rotateY: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
            </div>
          </motion.div>

       
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
          
            <div>
              <p className="text-teal-600 font-semibold text-lg mb-2">{book.genre}</p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">{book.title}</h1>
              <p className="text-xl text-gray-600">by <span className="font-semibold text-gray-800">{book.author}</span></p>
            </div>

          
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.floor(book.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-gray-600">({book.reviews?.length || 0} reviews)</span>
            </div>

           
            <div className="border-y border-gray-200 py-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">Rs. {book.price.toFixed(2)}</span>
                {book.stock > 0 && book.stock < 10 && (
                  <span className="text-sm text-orange-600 font-medium">Only {book.stock} left in stock!</span>
                )}
                {book.stock === 0 && (
                  <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
            </div>

          
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{book.description}</p>
            </div>

            
            {book.stock > 0 && (
              <div className="space-y-4">
               
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(book.stock, quantity + 1))} 
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

              
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="flex-1 btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" /> Add to Cart
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWishlistToggle}
                    className={`px-6 py-4 rounded-lg border-2 font-semibold flex items-center justify-center gap-2 transition-all ${
                      inWishlist 
                        ? 'bg-red-50 border-red-500 text-red-500' 
                        : 'bg-white border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500' : ''}`} /> 
                    {inWishlist ? 'Wishlisted' : 'Wishlist'}
                  </motion.button>
                </div>
              </div>
            )}

          
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <Truck className="w-8 h-8 text-teal-500" />
                <div>
                  <p className="font-semibold text-gray-900">Free Delivery</p>
                  <p className="text-sm text-gray-600">For orders over Rs. 1000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <Shield className="w-8 h-8 text-teal-500" />
                <div>
                  <p className="font-semibold text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-600">eSewa, Stripe & COD</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;