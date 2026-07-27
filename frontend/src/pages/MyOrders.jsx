// src/pages/MyOrders.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  ChevronDown, 
  ChevronUp,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CreditCard,
  Calendar,
  Tag,
  Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // ✅ Payment Status Configuration - NO EMOJIS
  const paymentStatusConfig = {
    confirmed: { 
      color: 'bg-green-100 text-green-700 border-green-300', 
      icon: CheckCircle, 
      label: 'Confirmed'
    },
    failed: { 
      color: 'bg-red-100 text-red-700 border-red-300', 
      icon: XCircle, 
      label: 'Failed'
    }
  };

  // ✅ Order Status Configuration - NO EMOJIS
  const orderStatusConfig = {
    pending: { 
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300', 
      icon: Clock, 
      label: 'Pending'
    },
    shipped: { 
      color: 'bg-blue-100 text-blue-700 border-blue-300', 
      icon: Truck, 
      label: 'Shipped'
    },
    delivered: { 
      color: 'bg-green-100 text-green-700 border-green-300', 
      icon: CheckCircle, 
      label: 'Delivered'
    },
    cancelled: { 
      color: 'bg-red-100 text-red-700 border-red-300', 
      icon: XCircle, 
      label: 'Cancelled'
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching orders for user:', user?.id);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📦 Orders response:', response.data);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, orderStatus: newStatus }
          : order
      ));
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // ✅ Get Payment Status Badge - NO EMOJIS
  const getPaymentStatusBadge = (status) => {
    const config = paymentStatusConfig[status];
    if (!config) return null;
    
    const Icon = config.icon;
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  // ✅ Get Order Status Badge - NO EMOJIS
  const getOrderStatusBadge = (status) => {
    const config = orderStatusConfig[status];
    if (!config) return null;
    
    const Icon = config.icon;
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getAvailableStatuses = (currentStatus) => {
    const statusFlow = ['pending', 'shipped', 'delivered'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return statusFlow.slice(currentIndex + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600 font-medium mb-3">{error}</p>
            <button 
              onClick={fetchOrders}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-teal-100 rounded-2xl">
                  <Package className="w-7 h-7 text-teal-600" />
                </div>
                My Orders
              </h1>
              <p className="text-gray-500 mt-1 ml-2">Track and manage your book orders</p>
            </div>
            <Link 
              to="/books"
              className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-xl transition-all hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-6">Start browsing books and place your first order!</p>
            <Link 
              to="/books"
              className="px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors inline-block font-medium"
            >
              Browse Books
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-teal-100 rounded-2xl">
                <Package className="w-7 h-7 text-teal-600" />
              </div>
              My Orders
            </h1>
            <p className="text-gray-500 mt-1 ml-2">
              {orders.length} order{orders.length > 1 ? 's' : ''} found
            </p>
          </div>
          <Link 
            to="/books"
            className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-xl transition-all hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => toggleExpand(order._id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-linear-to-br from-teal-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-md">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          #{order.orderNumber || order._id?.slice(-8) || 'N/A'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'N/A'}
                          <span className="text-gray-300">•</span>
                          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {getPaymentStatusBadge(order.paymentStatus)}
                      {getOrderStatusBadge(order.orderStatus)}
                      
                      <div className="text-right ml-2">
                        <p className="font-bold text-gray-900 text-lg">
                          Rs. {order.totalPrice?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <button 
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(order._id);
                        }}
                      >
                        {expandedOrder === order._id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedOrder === order._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-6 space-y-6 bg-gray-50/30">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            Order Items
                          </h4>
                          <div className="space-y-3">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                  {item.coverImage && (
                                    <img 
                                      src={item.coverImage} 
                                      alt={item.title}
                                      className="w-16 h-20 object-cover rounded-lg shadow-sm"
                                      onError={(e) => e.target.style.display = 'none'}
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{item.title || 'Unknown Item'}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity || 0}</p>
                                  </div>
                                  <div className="text-right">
                                    {item.discount > 0 && (
                                      <p className="text-sm text-gray-400 line-through">
                                        Rs. {(item.price * item.quantity).toFixed(2)}
                                      </p>
                                    )}
                                    <p className="font-semibold text-gray-900">
                                      Rs. {((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                                    </p>
                                    {item.discount > 0 && (
                                      <p className="text-xs text-green-600 font-medium">
                                        Saved Rs. {((item.price - (item.discountedPrice || item.price)) * item.quantity).toFixed(2)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm">No items found</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-teal-500" />
                              Shipping Address
                            </h4>
                            {order.shippingAddress ? (
                              <div className="space-y-1 text-sm">
                                <p className="font-medium text-gray-800">{order.shippingAddress.fullName || 'N/A'}</p>
                                <p className="text-gray-600">{order.shippingAddress.address || 'N/A'}</p>
                                <p className="text-gray-600">{order.shippingAddress.city || 'N/A'}</p>
                                <p className="text-gray-600">{order.shippingAddress.phone || 'N/A'}</p>
                                <p className="text-gray-500 text-xs">{order.shippingAddress.email || 'N/A'}</p>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No shipping address available</p>
                            )}
                          </div>

                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-teal-500" />
                              Order Summary
                            </h4>
                            <div className="space-y-1.5 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">Rs. {order.subtotal?.toFixed(2) || '0.00'}</span>
                              </div>
                              {order.totalDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Discount</span>
                                  <span>- Rs. {order.totalDiscount.toFixed(2)}</span>
                                </div>
                              )}
                              {order.deliveryFee > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Delivery Fee</span>
                                  <span className="font-medium">Rs. {order.deliveryFee.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="border-t border-gray-200 pt-2 mt-2">
                                <div className="flex justify-between font-bold text-gray-900">
                                  <span>Total</span>
                                  <span>Rs. {order.totalPrice?.toFixed(2) || '0.00'}</span>
                                </div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 pt-2">
                                <span>Payment Method</span>
                                <span className="capitalize">{order.paymentMethod || 'N/A'}</span>
                              </div>
                              {order.transactionId && (
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Transaction ID</span>
                                  <span className="font-mono truncate max-w-30">{order.transactionId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                          <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Truck className="w-4 h-4 text-blue-500" />
                              Update Order Status
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {getAvailableStatuses(order.orderStatus).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updateOrderStatus(order._id, status)}
                                  disabled={updatingStatus === order._id}
                                  className="px-5 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-200 disabled:opacity-50 text-sm font-medium capitalize shadow-sm hover:shadow-md"
                                >
                                  {updatingStatus === order._id ? (
                                    <Loader className="animate-spin h-4 w-4 mx-auto" />
                                  ) : (
                                    `Mark as ${status}`
                                  )}
                                </button>
                              ))}
                              {order.orderStatus === 'pending' && (
                                <button
                                  onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                  disabled={updatingStatus === order._id}
                                  className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50 text-sm font-medium shadow-sm hover:shadow-md"
                                >
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            Order Timeline
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <span className="text-gray-500">Ordered:</span>
                            <span className="font-medium text-gray-800">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                            </span>
                            {order.orderStatus === 'shipped' && order.updatedAt && (
                              <>
                                <span className="text-gray-300">→</span>
                                <span className="text-gray-500">Shipped:</span>
                                <span className="font-medium text-blue-600">
                                  {new Date(order.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </>
                            )}
                            {order.orderStatus === 'delivered' && order.updatedAt && (
                              <>
                                <span className="text-gray-300">→</span>
                                <span className="text-gray-500">Delivered:</span>
                                <span className="font-medium text-green-600">
                                  {new Date(order.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </>
                            )}
                            {order.orderStatus === 'cancelled' && order.updatedAt && (
                              <>
                                <span className="text-gray-300">→</span>
                                <span className="text-gray-500">Cancelled:</span>
                                <span className="font-medium text-red-600">
                                  {new Date(order.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;