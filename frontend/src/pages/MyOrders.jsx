import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Calendar, CreditCard, Eye } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/orders/my-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data.orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            processing: 'bg-blue-100 text-blue-800 border-blue-200',
            shipped: 'bg-purple-100 text-purple-800 border-purple-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-teal-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-gray-900 mb-8"
                >
                    My Orders
                </motion.h1>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-white rounded-2xl shadow-lg"
                    >
                        <Package className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
                        <Link to="/books" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
                            Browse Books
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Order #{order.orderNumber}</h3>
                                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                        </span>
                                        <Link
                                            to={`/orders/${order._id}`}
                                            className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {order.items.slice(0, 3).map((item) => (
                                        <div key={item.book._id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                            <img
                                                src={item.book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=50&h=70&fit=crop'}
                                                alt={item.book.title}
                                                className="w-8 h-10 object-cover rounded"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.book.title}</p>
                                                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                                            <span className="text-sm font-semibold text-gray-600">+{order.items.length - 3} more</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <CreditCard className="w-4 h-4" />
                                        <span className="text-sm capitalize">{order.paymentMethod}</span>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">
                                        Rs. {order.totalPrice.toFixed(2)}
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