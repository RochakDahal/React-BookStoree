// src/pages/StripePayment.jsx
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CreditCard } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// ✅ Initialize Stripe with public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ clientSecret, orderId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe is not loaded yet. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Confirming Stripe payment...');
      
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?orderId=${orderId}`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        console.error('❌ Stripe confirm error:', confirmError);
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      // ✅ If payment succeeded without redirect
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Stripe payment succeeded:', paymentIntent.id);
        
        // Verify with backend
        try {
          await axios.post(
            'http://localhost:5000/api/payments/stripe/verify',
            { 
              orderId: orderId,
              paymentIntentId: paymentIntent.id 
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setSuccess(true);
          
          // Redirect to success page after 2 seconds
          setTimeout(() => {
            navigate(`/payment-success?orderId=${orderId}`);
          }, 2000);
        } catch (verifyError) {
          console.error('❌ Stripe verification error:', verifyError);
          setError('Payment succeeded but verification failed. Please contact support.');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('❌ Stripe payment error:', err);
      setError(err.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Amount to pay:</span>
          <span className="font-bold text-purple-600">Rs. {amount?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      <PaymentElement />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✅ Payment successful! Redirecting...
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || success}
        className="w-full py-4 bg-linear-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all"
      >
        <Lock className="w-5 h-5" />
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Processing...
          </span>
        ) : success ? (
          'Payment Successful!'
        ) : (
          `Pay Rs. ${amount?.toFixed(2) || '0.00'} Securely`
        )}
      </button>
    </form>
  );
};

const StripePayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientSecret, orderId, amount } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('📍 StripePayment loaded with state:', { clientSecret, orderId, amount });

    if (!clientSecret || !orderId) {
      setError('Missing payment information. Please try again.');
      setLoading(false);
      return;
    }

    // ✅ Check if stripePromise is valid
    if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      setError('Stripe public key is missing. Please check your environment variables.');
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [clientSecret, orderId, amount]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something Went Wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Checkout
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Secure Card Payment</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Your payment will be processed securely through Stripe
          </p>

          {clientSecret && (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#7c3aed',
                  },
                }
              }}
            >
              <CheckoutForm 
                clientSecret={clientSecret} 
                orderId={orderId}
                amount={amount}
              />
            </Elements>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StripePayment;