import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Calendar, CreditCard, Truck } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(res.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-2xl text-gray-500">Order not found</p>
    </div>
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentColor = (method) => {
    const colors = {
      esewa: 'bg-green-100 text-green-800',
      stripe: 'bg-purple-100 text-purple-800',
      cod: 'bg-orange-100 text-orange-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-teal-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/orders" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-8">
          <ArrowLeft className="w-5 h-5" /> Back to Orders
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          
          <div className="bg-linear-to-r from-teal-500 to-cyan-500 p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
                <p className="text-teal-100 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </span>
            </div>
          </div>

          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b">
            <div className="flex items-start gap-3">
              <Package className="w-6 h-6 text-teal-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Items</p>
                <p className="font-semibold text-gray-900">{order.items.length} items</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="w-6 h-6 text-teal-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Payment</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPaymentColor(order.paymentMethod)}`}>
                  {order.paymentMethod.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="w-6 h-6 text-teal-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Delivery</p>
                <p className="font-semibold text-gray-900">Rs. {order.deliveryFee.toFixed(2)}</p>
              </div>
            </div>
          </div>

          
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.book._id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <img
                    src={item.book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100&h=150&fit=crop'}
                    alt={item.book.title}
                    className="w-20 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{item.book.title}</h3>
                    <p className="text-gray-600 text-sm">by {item.book.author}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">Qty: {item.quantity}</span>
                      <span className="font-bold text-teal-600">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          
          <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Shipping Address</h3>
              <p className="text-gray-600">{order.shippingAddress.fullName}</p>
              <p className="text-gray-600">{order.shippingAddress.address}</p>
              <p className="text-gray-600">{order.shippingAddress.city}</p>
              <p className="text-gray-600">{order.shippingAddress.phone}</p>
            </div>
            <div className="text-right">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {(order.totalPrice - order.deliveryFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>Rs. {order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>Rs. {order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetails;