import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const stripePromise = loadStripe('pk_test_YOUR_STRIPE_PUBLIC_KEY'); // Replace with your key

const CheckoutForm = ({ clientSecret, orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/stripe/success?orderId=${orderId}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Lock className="w-5 h-5" />
        {loading ? 'Processing...' : 'Pay Securely with Stripe'}
      </motion.button>
    </form>
  );
};

const CheckoutStripe = () => {
  const location = useLocation();
  const { order } = location.state || {};
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order) return;
    
    const createIntent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('http://localhost:5000/api/payments/stripe/create-intent', 
          { orderId: order._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClientSecret(res.data.clientSecret);
      } catch (error) {
        console.error('Error creating Stripe intent:', error);
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [order]);

  if (!order) return <div className="text-center py-20">No order found.</div>;
  if (loading) return <div className="text-center py-20">Loading Stripe...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Secure Card Payment</h2>
          <p className="text-gray-600 mb-6">Amount to pay: <span className="font-bold text-teal-600">Rs. {order.totalPrice.toFixed(2)}</span></p>
          
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} orderId={order._id} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutStripe;