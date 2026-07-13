// src/pages/PaymentSuccess.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const dataParam = queryParams.get('data');
  const sessionId = queryParams.get('session_id');
  const orderIdFromUrl = queryParams.get('orderId');
  const orderIdFromState = location.state?.orderId;

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        console.log('🔍 Verifying payment...');
        console.log('📦 Session ID:', sessionId);
        console.log('📦 Data param:', dataParam);

        // ✅ For Stripe - verify session
        if (sessionId) {
          console.log('🔄 Verifying Stripe session...');
          
          const response = await axios.get(
            `http://localhost:5000/api/payments/stripe/verify-session?sessionId=${sessionId}`
          );

          console.log('✅ Verification response:', response.data);

          if (response.data.success) {
            // Fetch the order
            const orderResponse = await axios.get(
              `http://localhost:5000/api/orders/${response.data.orderId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrder(orderResponse.data.order);
            console.log('✅ Order confirmed:', orderResponse.data.order);
          } else {
            setError(response.data.message || 'Payment verification failed');
          }
        } 
        // ✅ For eSewa - verify with data param
        else if (dataParam) {
          console.log('🔄 Verifying eSewa payment...');
          
          const response = await axios.get(
            `http://localhost:5000/api/payments/complete?data=${encodeURIComponent(dataParam)}`
          );

          console.log('✅ Verification response:', response.data);

          if (response.data.success) {
            setOrder(response.data.order);
            console.log('✅ Order confirmed:', response.data.order);
          } else {
            setError(response.data.message || 'Payment verification failed');
          }
        } 
        // ✅ For COD or direct success
        else if (orderIdFromUrl || orderIdFromState) {
          const orderId = orderIdFromUrl || orderIdFromState;
          console.log('🔄 Fetching order details...');
          
          const response = await axios.get(
            `http://localhost:5000/api/orders/${orderId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setOrder(response.data.order);
        } else {
          setError('No transaction found');
        }
      } catch (err) {
        console.error('❌ Verification error:', err);
        setError(err.response?.data?.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    if (location.search || location.state) {
      verifyPayment();
    } else {
      setError('No payment data found');
      setLoading(false);
    }
  }, [location, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
        <p className="ml-4 text-gray-600">Verifying your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/my-orders')}
            className="mt-4 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-linear-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h1>
        <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been confirmed.</p>

        {order && (
          <div className="bg-gray-50 rounded-xl p-6 text-left mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-medium text-gray-900">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-teal-600">Rs. {order.totalPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  ✅ {order.orderStatus || 'Confirmed'}
                </span>
              </div>
              {order.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-medium text-gray-900 text-xs truncate max-w-50">
                    {order.transactionId}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/my-orders')}
            className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            View My Orders
          </button>
          <button
            onClick={() => navigate('/books')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;