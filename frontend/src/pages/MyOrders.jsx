// src/pages/MyOrders.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MyOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">No Orders Yet</h2>
            <p className="text-gray-400">Start shopping to see your orders here</p>
            <Link to="/books" className="mt-4 inline-block btn-primary">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1) || 'Pending'}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {order.totalPrice?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items?.slice(0, 3).map((item) => (
                      <div key={item._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <img
                          src={item.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=60&h=80&fit=crop'}
                          alt={item.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <p className="text-xs text-gray-400">
                        + {order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-teal-500 hover:text-teal-600 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;