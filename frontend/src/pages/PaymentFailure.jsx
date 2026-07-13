// src/pages/PaymentFailure.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const dataParam = queryParams.get('data');

  useEffect(() => {
    console.log('❌ Payment failed');
    console.log('📦 Data param:', dataParam);
  }, [dataParam]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-4">
          Your payment could not be processed. Please try again.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left text-sm text-red-700 mb-8">
          <p className="font-medium">Possible reasons:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
            <li>Insufficient balance</li>
            <li>Invalid card details</li>
            <li>Network connection issue</li>
            <li>Transaction timed out</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/cart')}
            className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailure;