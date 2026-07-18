import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, ShoppingCart, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats);
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="text-center py-10">Loading...</div>;

  const cards = [
    { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: 'bg-purple-500' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-orange-500' },
  ];

  // Dummy data for chart
  const chartData = [
    { name: 'Mon', sales: 4000 }, { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5000 }, { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 }, { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="text-white w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {stats.recentOrders.map((order) => (
              <div key={order._id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-semibold text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.user?.firstName}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.orderStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;