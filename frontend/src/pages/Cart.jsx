import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Cart = () => {
  const { cartItems, loading, updateQuantity, removeFromCart, getCartTotal } = useCart();

  if (loading) return <LoadingSpinner fullScreen />;

  const deliveryFee = getCartTotal() > 1000 ? 0 : 100;
  const total = getCartTotal() + deliveryFee;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-teal-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 mb-8"
        >
          Shopping Cart
        </motion.h1>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-2xl shadow-lg"
          >
            <ShoppingBag className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some books to get started!</p>
            <Link to="/books" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
              Browse Books <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.book._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-white rounded-2xl shadow-lg p-6 flex gap-6"
                  >
                    <img
                      src={item.book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop'}
                      alt={item.book.title}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <Link to={`/books/${item.book._id}`} className="text-xl font-bold text-gray-900 hover:text-teal-600 transition-colors">
                        {item.book.title}
                      </Link>
                      <p className="text-gray-600 mt-1">by {item.book.author}</p>
                      <p className="text-teal-600 font-bold text-lg mt-2">Rs. {item.book.price.toFixed(2)}</p>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.book._id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.book._id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.book._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-24"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee.toFixed(2)}`}</span>
                </div>
                <hr />
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <Link to="/checkout" className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </Link>
              
              {getCartTotal() < 1000 && (
                <p className="text-center text-sm text-gray-600 mt-4">
                  Add Rs. {(1000 - getCartTotal()).toFixed(2)} more for free delivery!
                </p>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;