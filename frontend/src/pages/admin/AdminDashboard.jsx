// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, ShoppingCart, DollarSign, 
  Star, MessageSquare, Mail, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats);
      setError('');
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.response?.data?.message || 'Failed to fetch stats');
      if (error.response?.status === 403) {
        alert('You need admin access to view this page');
      }
    } finally {
      setLoading(false);
    }
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
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  const cards = [
    { 
      label: 'Total Revenue', 
      value: `Rs. ${stats?.totalRevenue?.toFixed(2) || '0.00'}`, 
      icon: DollarSign, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Total Orders', 
      value: stats?.totalOrders || 0, 
      icon: ShoppingCart, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Total Books', 
      value: stats?.totalBooks || 0, 
      icon: BookOpen, 
      color: 'bg-purple-500' 
    },
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'bg-orange-500' 
    },
    { 
      label: 'Total Reviews', 
      value: stats?.recentReviews?.length || 0, 
      icon: Star, 
      color: 'bg-yellow-500' 
    },
    { 
      label: 'Total Messages', 
      value: stats?.totalContacts || 0, 
      icon: Mail, 
      color: 'bg-rose-500' 
    },
  ];

  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      read: 'bg-blue-100 text-blue-800',
      replied: 'bg-green-100 text-green-800'
    };
    return styles[status] || styles.pending;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="text-white w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-4">Weekly Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {stats?.recentOrders?.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-semibold text-sm">{order.orderNumber || order._id.slice(-8)}</p>
                    <p className="text-xs text-gray-500">{order.user?.firstName || 'Unknown'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.orderStatus === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.orderStatus || 'pending'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent orders</p>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Reviews & Contacts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Reviews */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Recent Reviews
            </h3>
            <Link to="/admin/reviews" className="text-sm text-teal-500 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {stats?.recentReviews?.length > 0 ? (
              stats.recentReviews.map((review, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b pb-2 last:border-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{review.userName || 'User'}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        on "{review.bookTitle}" • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No reviews yet</p>
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-500" />
              Recent Messages
            </h3>
            <Link to="/admin/contacts" className="text-sm text-teal-500 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {stats?.recentContacts?.length > 0 ? (
              stats.recentContacts.map((contact) => (
                <motion.div
                  key={contact._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border-b pb-2 last:border-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.email}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{contact.comment}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(contact.status)}`}>
                      {contact.status}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No messages yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;