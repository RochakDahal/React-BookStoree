// src/pages/OrderDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock,
  MapPin, Phone, Mail, User, CreditCard, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (id) {
      fetchOrder();
    }
  }, [id, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching order:', id);
      console.log('🔑 Token:', token);

      const response = await axios.get(`http://localhost:5000/api/orders/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Order response:', response.data);

      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setError(response.data.message || 'Failed to fetch order');
      }
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 403) {
        setError('You are not authorized to view this order.');
      } else if (error.response?.status === 404) {
        setError('Order not found.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch order details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return styles[status] || styles.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={fetchOrder}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/my-orders"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-500">The order you're looking for doesn't exist.</p>
          <Link to="/my-orders" className="mt-4 inline-block text-teal-500 hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate('/my-orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Order Header */}
          <div className="bg-linear-to-r from-teal-500 to-cyan-500 px-6 py-8 text-white">
            <div className="flex flex-wrap justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">
                  Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(order.orderStatus)}`}>
                  {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1) || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Order Summary with Discount */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-500" />
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Rs. {order.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {order.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      Discount
                    </span>
                    <span>- Rs. {order.totalDiscount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>{order.deliveryFee === 0 ? 'Free' : `Rs. ${order.deliveryFee?.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-teal-600">Rs. {order.totalPrice?.toFixed(2) || '0.00'}</span>
                </div>
                {order.totalDiscount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center text-sm text-green-700 mt-2">
                    🎉 You saved Rs. {order.totalDiscount?.toFixed(2)} with discounts!
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-500" />
                Items ({order.items?.length || 0})
              </h3>
              <div className="space-y-3">
                {order.items?.map((item) => {
                  const hasDiscount = item.discount && item.discount > 0;
                  const itemTotal = hasDiscount 
                    ? (item.discountedPrice || item.price) * item.quantity
                    : item.price * item.quantity;
                  
                  return (
                    <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <img
                        src={item.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80&h=120&fit=crop'}
                        alt={item.title}
                        className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.title}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        {hasDiscount ? (
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-sm text-gray-400 line-through">
                              Rs. {item.price?.toFixed(2)}
                            </span>
                            <span className="text-sm font-bold text-teal-600">
                              Rs. {item.discountedPrice?.toFixed(2)}
                            </span>
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              {item.discount}% OFF
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-gray-900">
                            Rs. {item.price?.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm sm:text-base">
                          Rs. {itemTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-500" />
                Shipping Address
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
                <p className="text-gray-600 text-sm">{order.shippingAddress?.address}</p>
                <p className="text-gray-600 text-sm">{order.shippingAddress?.city}</p>
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {order.shippingAddress?.phone}
                </p>
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {order.shippingAddress?.email}
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-500" />
                Payment Information
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-900 capitalize">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Status</p>
                  <p className={`font-medium ${
                    order.paymentStatus === 'completed' ? 'text-green-600' : 
                    order.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'Pending'}
                  </p>
                </div>
                {order.transactionId && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500">Transaction ID</p>
                    <p className="text-xs text-gray-600 break-all font-mono">{order.transactionId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetails;