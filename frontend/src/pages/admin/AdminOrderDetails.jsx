// src/pages/admin/AdminOrderDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  Tag,
  User,
  Mail,
  Phone,
  Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://react-book-storee-huj6.vercel.app'}/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data.order);
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (field, value) => {
    try {
      setUpdating(true);
      const updateData = {};
      if (field === 'orderStatus') updateData.orderStatus = value;
      if (field === 'paymentStatus') updateData.paymentStatus = value;

      await axios.put(
        `${import.meta.env.VITE_API_URL || 'https://react-book-storee-huj6.vercel.app'}/api/admin/orders/${id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`${field} updated successfully`);
      fetchOrderDetails();
    } catch (error) {
      console.error('❌ Error updating order:', error);
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  // ✅ Status Badge - Payment: confirmed/failed, Order: pending/shipped/delivered/cancelled
  const getStatusBadge = (status, type) => {
    const configs = {
      payment: {
        confirmed: { 
          color: 'bg-green-100 text-green-700', 
          icon: CheckCircle, 
          label: '✅ Confirmed'
        },
        failed: { 
          color: 'bg-red-100 text-red-700', 
          icon: XCircle, 
          label: '❌ Failed'
        }
      },
      order: {
        pending: { 
          color: 'bg-yellow-100 text-yellow-700', 
          icon: Clock, 
          label: '⏳ Pending'
        },
        shipped: { 
          color: 'bg-blue-100 text-blue-700', 
          icon: Truck, 
          label: '🚚 Shipped'
        },
        delivered: { 
          color: 'bg-green-100 text-green-700', 
          icon: CheckCircle, 
          label: '✅ Delivered'
        },
        cancelled: { 
          color: 'bg-red-100 text-red-700', 
          icon: XCircle, 
          label: '❌ Cancelled'
        }
      }
    };

    const config = type === 'payment' ? configs.payment[status] : configs.order[status];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600 font-medium mb-3">{error || 'Order not found'}</p>
            <Link to="/admin/orders" className="text-teal-500 hover:text-teal-600 font-medium">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-6 h-6 text-teal-500" />
                Order #{order.orderNumber || order._id.slice(-8)}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4" />
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {getStatusBadge(order.paymentStatus, 'payment')}
              {getStatusBadge(order.orderStatus, 'order')}
            </div>
          </div>
        </motion.div>

        {/* Status Update Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">⚙️</span> Update Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <div className="flex gap-2">
                <select
                  value={order.paymentStatus || 'failed'}
                  onChange={(e) => updateOrderStatus('paymentStatus', e.target.value)}
                  disabled={updating}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white disabled:opacity-50"
                >
                  <option value="confirmed">✅ Confirmed</option>
                  <option value="failed">❌ Failed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <div className="flex gap-2">
                <select
                  value={order.orderStatus || 'pending'}
                  onChange={(e) => updateOrderStatus('orderStatus', e.target.value)}
                  disabled={updating}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white disabled:opacity-50"
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="shipped">🚚 Shipped</option>
                  <option value="delivered">✅ Delivered</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          {updating && (
            <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-500 border-t-transparent"></div>
              Updating status...
            </div>
          )}
        </motion.div>

        {/* Customer Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-500" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">
                  {order.user?.firstName} {order.user?.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{order.user?.email}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{order.shippingAddress?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">City:</span>
                <span className="font-medium text-gray-900">{order.shippingAddress?.city || 'N/A'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            Order Items ({order.items?.length || 0})
          </h3>
          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                {item.coverImage && (
                  <img 
                    src={item.coverImage} 
                    alt={item.title}
                    className="w-16 h-20 object-cover rounded-lg"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
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
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Shipping Address & Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-500" />
              Shipping Address
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
              <p className="text-gray-600">{order.shippingAddress?.address}</p>
              <p className="text-gray-600">{order.shippingAddress?.city}</p>
              <p className="text-gray-600">{order.shippingAddress?.phone}</p>
              <p className="text-gray-500 text-xs">{order.shippingAddress?.email}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-500" />
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
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
                <span className="capitalize font-medium">{order.paymentMethod}</span>
              </div>
              {order.transactionId && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Transaction ID</span>
                  <span className="font-mono truncate max-w-37.5">{order.transactionId}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Order Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 mt-6 border border-gray-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Order Timeline
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-600">📦 Order Placed</span>
              <span className="font-medium text-gray-800">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {order.orderStatus === 'shipped' && (
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                <span className="text-blue-600">🚚 Shipped</span>
                <span className="font-medium text-blue-800">
                  {new Date(order.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            {order.orderStatus === 'delivered' && (
              <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                <span className="text-green-600">✅ Delivered</span>
                <span className="font-medium text-green-800">
                  {new Date(order.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
            {order.orderStatus === 'cancelled' && (
              <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                <span className="text-red-600">❌ Cancelled</span>
                <span className="font-medium text-red-800">
                  {new Date(order.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;