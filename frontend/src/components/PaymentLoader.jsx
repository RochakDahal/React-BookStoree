import { motion } from 'framer-motion';
import { CreditCard, CheckCircle } from 'lucide-react';

const PaymentLoader = ({ method, status = 'processing' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-teal-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full"
      >
        {status === 'processing' ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center"
            >
              <CreditCard className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we process your {method} payment...</p>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Redirecting to your order details...</p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentLoader;