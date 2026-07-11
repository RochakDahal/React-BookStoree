import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Truck, CheckCircle, User, Phone, Mail, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    phone: '',
    email: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});


  useEffect(() => {
    if (user) {
      setFormData({
      
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(), 
        address: user.address || '',
        city: user.city || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user]); // Runs whenever the user data is loaded

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const deliveryFee = getCartTotal() > 1000 ? 0 : 100;
  const total = getCartTotal() + deliveryFee;

    const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        items: cartItems.map(item => ({
          book: item.book._id,
          quantity: item.quantity,
          price: item.book.price
        })),
        shippingAddress: formData,
        paymentMethod,
        totalPrice: total
      };

      // 1. Create the order in the backend (Status: Pending)
      const res = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newOrder = res.data.order;
      await clearCart(); // Clear cart immediately

      // 2. Route based on payment method
      if (paymentMethod === 'cod') {
        // For COD, go directly to success
        navigate('/order-success', { state: { orderId: newOrder.orderNumber } });
      } else if (paymentMethod === 'esewa') {
        // Redirect to eSewa page with order data
        navigate('/payment/esewa', { state: { order: newOrder } });
      } else if (paymentMethod === 'stripe') {
        // Redirect to Stripe page with order data
        navigate('/payment/stripe', { state: { order: newOrder } });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  if (cartItems.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-teal-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 mb-8"
        >
          Checkout
        </motion.h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
          <div className="lg:col-span-2 space-y-6">
            
       
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="bg-linear-to-r from-teal-500 to-cyan-500 px-6 py-4 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Shipping Address</h2>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Row 1: Full Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-teal-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span> {errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-teal-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                        placeholder="98XXXXXXXX"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span> {errors.phone}</p>}
                  </div>
                </div>

               
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-teal-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span> {errors.email}</p>}
                </div>


                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address *</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className={`w-full pl-11 pr-4 py-3 bg-gray-50 border ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-teal-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all resize-none`}
                      placeholder="House no, Street, Landmark..."
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span> {errors.address}</p>}
                </div>

                {/* Row 4: City */}
                <div className="md:w-1/2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 bg-gray-50 border ${errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-teal-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                      placeholder="Kathmandu"
                    />
                  </div>
                  {errors.city && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span> {errors.city}</p>}
                </div>
              </div>
            </motion.div>

            {/* --- PAYMENT METHOD --- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="bg-linear-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Payment Method</h2>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'esewa', name: 'eSewa', icon: '💳', color: 'border-green-500 bg-green-50' },
                  { id: 'stripe', name: 'Stripe', icon: '💳', color: 'border-purple-500 bg-purple-50' },
                  { id: 'cod', name: 'Cash on Delivery', icon: '💵', color: 'border-orange-500 bg-orange-50' }
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? `${method.color} shadow-md`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-3xl mb-2">{method.icon}</span>
                    <span className="font-semibold text-gray-900 text-center text-sm">{method.name}</span>
                    {paymentMethod === method.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5 text-teal-500" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.book._id} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <img
                      src={item.book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100&h=150&fit=crop'}
                      alt={item.book.title}
                      className="w-16 h-20 object-cover rounded-lg shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.book.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      <p className="text-teal-600 font-bold text-sm mt-1">Rs. {(item.book.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>Rs. {getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-teal-600">Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-lg font-semibold mt-6 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-teal-500/30"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Truck className="w-5 h-5" /> Place Order
                  </>
                )}
              </motion.button>
              
              {getCartTotal() < 1000 && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  Add Rs. {(1000 - getCartTotal()).toFixed(2)} more for <span className="text-green-600 font-semibold">FREE delivery!</span>
                </p>
              )}
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;