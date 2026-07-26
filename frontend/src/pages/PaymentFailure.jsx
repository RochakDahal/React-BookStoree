// src/pages/PaymentFailure.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log('❌ Payment failed:', location);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed 😔</h1>
        <p className="text-gray-600 mb-2">Your payment could not be processed.</p>
        <p className="text-sm text-gray-500 mb-8">
          Please try again or use a different payment method.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Return to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;