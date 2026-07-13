// src/pages/CheckoutStripe.jsx
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock, AlertCircle } from 'lucide-react';

// ✅ Use environment variable for Stripe key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_YOUR_KEY');

const CheckoutForm = ({ clientSecret, orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError('Stripe is not loaded yet. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/stripe/success?orderId=${orderId}`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // ✅ Payment succeeded - redirect to success
        navigate(`/order-success/${orderId}`);
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0.5" />
          <span>{error}</span>
        </div>
      )}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 bg-linear-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all"
      >
        <Lock className="w-5 h-5" />
        {loading ? 'Processing...' : `Pay Rs. ${clientSecret ? 'Securely' : ''}`}
      </motion.button>
    </form>
  );
};

const CheckoutStripe = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!order) {
      navigate('/cart');
      return;
    }

    const createIntent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'http://localhost:5000/api/payments/stripe/create-intent',
          { orderId: order._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error('Stripe intent error:', err);
        setError(err.response?.data?.message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Card Payment</h2>
          <p className="text-gray-600 mb-6">
            Amount: <span className="font-bold text-purple-600">Rs. {order.totalPrice.toFixed(2)}</span>
          </p>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-500 mt-4">Initializing payment...</p>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} orderId={order._id} />
            </Elements>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutStripe;