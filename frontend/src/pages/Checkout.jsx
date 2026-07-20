// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  ShoppingBag, CreditCard, Wallet, Truck, MapPin, Phone, Mail, User, Loader2
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [error, setError] = useState('');

  const total = getTotal ? getTotal() : 0;
  const deliveryFee = total > 1000 ? 0 : 100;
  const grandTotal = total + deliveryFee;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.firstName + ' ' + user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      // ✅ Order data with discount information
      const orderData = {
        items: cartItems.map(item => ({
          bookId: item.bookId?._id || item.bookId,
          title: item.bookId?.title || item.title,
          price: item.bookId?.price || item.price,
          quantity: item.quantity,
          coverImage: item.bookId?.coverImage || item.coverImage
        })),
        deliveryFee: deliveryFee,
        paymentMethod: paymentMethod,
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city
        }
      };

      console.log('📤 Sending order data:', orderData);

      // ✅ Create order in backend
      const orderResponse = await axios.post(
        'http://localhost:5000/api/orders',
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Order created:', orderResponse.data);

      const order = orderResponse.data.order;

      // ✅ Handle based on payment method
      if (paymentMethod === 'cod') {
        // COD - Confirm immediately
        await axios.post(
          'http://localhost:5000/api/payments/cod-confirm',
          { orderId: order._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        await clearCart();
        navigate('/payment-success', { 
          state: { 
            orderId: order._id,
            amount: grandTotal,
            paymentMethod: 'cod'
          }
        });
        
      } else if (paymentMethod === 'esewa') {
        console.log('🔄 Initiating eSewa payment...');
        
        const paymentResponse = await axios.post(
          'http://localhost:5000/api/payments/initiate',
          { 
            orderId: order._id,
            paymentGateway: 'esewa'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('✅ eSewa response:', paymentResponse.data);

        if (paymentResponse.data.success) {
          // ✅ Create and submit eSewa form
          const formData = paymentResponse.data.formData;
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

          Object.entries(formData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
          });

          document.body.appendChild(form);
          await clearCart();
          form.submit();
        } else {
          setError('Failed to initiate eSewa payment');
          setSubmitting(false);
        }
        
      } else if (paymentMethod === 'stripe') {
        console.log('🔄 Initiating Stripe payment...');
        
        const paymentResponse = await axios.post(
          'http://localhost:5000/api/payments/initiate',
          { 
            orderId: order._id,
            paymentGateway: 'stripe'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('✅ Stripe response:', paymentResponse.data);

        if (paymentResponse.data.success && paymentResponse.data.clientSecret) {
          await clearCart();
          navigate('/stripe-payment', { 
            state: { 
              clientSecret: paymentResponse.data.clientSecret,
              orderId: order._id,
              amount: grandTotal
            }
          });
        } else {
          setError(paymentResponse.data.message || 'Failed to initiate Stripe payment');
          setSubmitting(false);
        }
      }

    } catch (err) {
      console.error('❌ Order error:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to place order');
      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = [
    { id: 'cod', icon: Truck, label: 'Cash on Delivery', color: 'orange' },
    { id: 'esewa', icon: Wallet, label: 'eSewa', color: 'green' },
    { id: 'stripe', icon: CreditCard, label: 'Stripe', color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your order details below</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handlePlaceOrder} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-500" />
                Shipping Address
              </h2>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="9841234567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Kathmandu"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-teal-500" />
                  Payment Method
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    const colorClasses = {
                      orange: 'from-orange-500 to-orange-600',
                      green: 'from-green-500 to-green-600',
                      purple: 'from-purple-500 to-purple-600'
                    };
                    return (
                      <motion.button
                        key={method.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          isSelected
                            ? `border-${method.color}-500 bg-${method.color}-50 shadow-md`
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isSelected ? `bg-linear-to-r ${colorClasses[method.color]} text-white` : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className={`font-medium ${isSelected ? `text-${method.color}-700` : 'text-gray-700'}`}>
                            {method.label}
                          </p>
                          {isSelected && (
                            <motion.p
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs text-green-600"
                            >
                              ✓ Selected
                            </motion.p>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-linear-to-r from-teal-500 to-cyan-500 hover:shadow-lg'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Place Order - Rs. ${grandTotal.toFixed(2)}`
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Right: Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-teal-500" />
                Order Summary
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item, index) => {
                  const hasDiscount = item.discount || item.bookId?.discount > 0;
                  const discountPercent = item.discount || item.bookId?.discount || 0;
                  const originalPrice = item.bookId?.price || item.price || 0;
                  const discountedPrice = hasDiscount 
                    ? originalPrice - (originalPrice * discountPercent / 100) 
                    : originalPrice;
                  
                  return (
                    <motion.div
                      key={item.bookId?._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={item.bookId?.coverImage || item.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80&h=120&fit=crop'}
                        alt={item.bookId?.title || item.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.bookId?.title || item.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        {hasDiscount && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400 line-through">
                              Rs. {originalPrice.toFixed(2)}
                            </span>
                            <span className="text-xs font-bold text-teal-600">
                              Rs. {discountedPrice.toFixed(2)}
                            </span>
                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                              {discountPercent}% OFF
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        Rs. {(discountedPrice * item.quantity).toFixed(2)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? 'Free' : `Rs. ${deliveryFee.toFixed(2)}`}</span>
                </div>
                {deliveryFee === 0 && total > 0 && (
                  <p className="text-xs text-green-600">Free delivery on orders over Rs. 1,000</p>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-teal-600">Rs. {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;