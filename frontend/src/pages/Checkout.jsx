// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  Wallet,
  ArrowLeft,
  CheckCircle,
  Loader
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  useEffect(() => {
    if (user) {
      setShippingAddress({
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      navigate('/cart');
    }
  }, [cartItems, navigate, loading]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      
      const orderData = {
        items: cartItems.map(item => ({
          bookId: item.bookId._id || item.bookId,
          title: item.title,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryFee: 0,
        paymentMethod: selectedPayment,
        shippingAddress: shippingAddress
      };

      console.log('📝 Creating order:', orderData);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'https://react-book-storee-huj6.vercel.app'}/api/orders`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Order created:', response.data);
      setCreatedOrderId(response.data.order._id);
      return response.data.order._id;
    } catch (error) {
      console.error('❌ Create order error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmCODOrder = async (orderId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'https://react-book-storee-huj6.vercel.app'}/api/payments/cod-confirm`,
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/payment-success?orderId=${orderId}`);
    } catch (error) {
      console.error('❌ COD confirmation error:', error);
      toast.error('Failed to confirm COD order');
    }
  };

  // ✅ Handle Stripe Payment - Redirect to Stripe Checkout
  const handleStripePayment = async (orderId) => {
    try {
      console.log('💰 Initiating Stripe payment for order:', orderId);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'https://react-book-storee-huj6.vercel.app'}/api/payments/initiate`,
        {
          orderId: orderId,
          paymentGateway: 'stripe'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('💳 Stripe payment response:', response.data);

      if (response.data.success && response.data.sessionUrl) {
        console.log('🔄 Redirecting to Stripe Checkout...');
        // ✅ Redirect to Stripe's hosted payment page
        window.location.href = response.data.sessionUrl;
      } else {
        toast.error('Failed to get Stripe checkout URL');
        setProcessing(false);
      }
    } catch (error) {
      console.error('❌ Stripe payment error:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to initiate Stripe payment');
      setProcessing(false);
    }
  };

  // ✅ Handle eSewa Payment
  const handleEsewaPayment = async (orderId) => {
    try {
      console.log('💰 Initiating eSewa payment for order:', orderId);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'https://react-book-storee-huj6.vercel.app'}/api/payments/initiate`,
        {
          orderId: orderId,
          paymentGateway: 'esewa'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('💳 eSewa payment response:', response.data);

      if (response.data.success && response.data.formData) {
        // ✅ Submit eSewa form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
        
        const formData = response.data.formData;
        Object.keys(formData).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = formData[key];
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else {
        toast.error('Failed to get eSewa form data');
        setProcessing(false);
      }
    } catch (error) {
      console.error('❌ eSewa payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate eSewa payment');
      setProcessing(false);
    }
  };

  // ✅ Main payment handler
  const handlePayment = async () => {
    try {
      setProcessing(true);
      console.log('💰 Processing payment with:', selectedPayment);

      // ✅ First create the order if not already created
      let orderId = createdOrderId;
      if (!orderId) {
        orderId = await createOrder();
      }

      if (!orderId) {
        toast.error('Failed to create order');
        setProcessing(false);
        return;
      }

      // ✅ Handle different payment methods
      if (selectedPayment === 'cod') {
        await confirmCODOrder(orderId);
        setProcessing(false);
        return;
      }

      if (selectedPayment === 'stripe') {
        await handleStripePayment(orderId);
        // Note: Don't set processing false here because we're redirecting
        return;
      }

      if (selectedPayment === 'esewa') {
        await handleEsewaPayment(orderId);
        // Note: Don't set processing false here because we're submitting a form
        return;
      }

      toast.error('Invalid payment method');
      setProcessing(false);
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment initiation failed');
      setProcessing(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!shippingAddress.fullName || !shippingAddress.email || 
        !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      toast.error('Please fill in all shipping address fields');
      return;
    }

    await handlePayment();
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = cartItems.reduce((sum, item) => {
    if (item.discount > 0) {
      return sum + ((item.price * item.discount / 100) * item.quantity);
    }
    return sum;
  }, 0);
  const deliveryFee = 0;
  const totalAmount = subtotal - discount + deliveryFee;

  if (cartItems.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-teal-500" />
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={shippingAddress.email}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="9800000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Kathmandu"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-500" />
                Payment Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPayment('cod')}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    selectedPayment === 'cod'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Wallet className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Cash on Delivery</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayment('esewa')}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    selectedPayment === 'esewa'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">💰</span>
                    <span className="font-medium">eSewa</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayment('stripe')}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    selectedPayment === 'stripe'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Stripe</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-teal-500" />
                Order Summary
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cartItems.map((item) => (
                  <div key={item._id || item.bookId} className="flex items-center gap-3 py-2 border-b border-gray-100">
                    {item.coverImage && (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-12 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- Rs. {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">Rs. {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-gray-900 text-lg">
                    <span>Total</span>
                    <span>Rs. {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={processing || loading}
                className="w-full mt-6 py-3.5 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;