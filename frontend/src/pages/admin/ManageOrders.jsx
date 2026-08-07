// src/pages/admin/ManageOrders.jsx
import { useEffect, useState } from 'react';
import { Eye, RefreshCw, CheckCircle, XCircle, Clock, Truck, Package } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { 
    fetchOrders(); 
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'https://react-book-storee-huj6.vercel.app'}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || []);
      setError('');
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, field, value) => {
    try {
      const token = localStorage.getItem('token');
      const updateData = {};
      if (field === 'orderStatus') updateData.orderStatus = value;
      if (field === 'paymentStatus') updateData.paymentStatus = value;

      await axios.put(
        `${import.meta.env.VITE_API_URL || 'https://react-book-storee-huj6.vercel.app'}/api/admin/orders/${id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`${field} updated successfully`);
      fetchOrders();
    } catch (error) {
      console.error('❌ Error updating order:', error);
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };

  // ✅ Order Status Badge - NO EMOJIS
  const getOrderStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      shipped: 'bg-blue-100 text-blue-700 border-blue-200',
      delivered: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200'
    };
    const icons = {
      pending: Clock,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle
    };
    const labels = {
      pending: 'Pending',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    const normalizedStatus = status?.toLowerCase() || 'pending';
    const Icon = icons[normalizedStatus] || Clock;
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border ${styles[normalizedStatus] || styles.pending}`}>
        <Icon className="w-3.5 h-3.5" />
        {labels[normalizedStatus] || 'Pending'}
      </span>
    );
  };

  // ✅ Payment Status Badge - NO EMOJIS
  const getPaymentStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      failed: 'bg-red-100 text-red-700 border-red-200'
    };
    const icons = {
      confirmed: CheckCircle,
      failed: XCircle
    };
    const labels = {
      confirmed: 'Confirmed',
      failed: 'Failed'
    };
    const normalizedStatus = status?.toLowerCase() || 'failed';
    const Icon = icons[normalizedStatus] || XCircle;
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border ${styles[normalizedStatus] || styles.failed}`}>
        <Icon className="w-3.5 h-3.5" />
        {labels[normalizedStatus] || 'Failed'}
      </span>
    );
  };

  // ✅ Payment Method Badge
  const getPaymentMethodBadge = (method) => {
    const styles = {
      cod: 'bg-orange-100 text-orange-700 border-orange-200',
      esewa: 'bg-purple-100 text-purple-700 border-purple-200',
      stripe: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    const labels = {
      cod: 'COD',
      esewa: 'eSewa',
      stripe: 'Stripe'
    };
    const normalizedMethod = method?.toLowerCase() || 'cod';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[normalizedMethod] || styles.cod}`}>
        {labels[normalizedMethod] || 'COD'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchOrders}
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} orders found</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-sm border-b">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Order Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.user?.firstName} {order.user?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.user?.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      Rs. {order.totalPrice?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-4">
                      {getPaymentMethodBadge(order.paymentMethod)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getPaymentStatusBadge(order.paymentStatus)}
                        <select 
                          value={order.paymentStatus || 'failed'} 
                          onChange={(e) => handleStatusChange(order._id, 'paymentStatus', e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getOrderStatusBadge(order.orderStatus)}
                        <select 
                          value={order.orderStatus || 'pending'} 
                          onChange={(e) => handleStatusChange(order._id, 'orderStatus', e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Link 
                        to={`/admin/orders/${order._id}`} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;