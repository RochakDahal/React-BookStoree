// src/pages/PaymentEsewa.jsx
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PaymentEsewa = () => {
  const formRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { order, formData } = location.state || {};

  useEffect(() => {
    if (!order) {
      navigate('/cart');
      return;
    }

    console.log('📦 eSewa Form Data:', formData);

    const timer = setTimeout(() => {
      if (formRef.current) {
        console.log('📤 Submitting eSewa v2 form...');
        formRef.current.submit();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [order, navigate, formData]);

  if (!order) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Redirecting to eSewa</h2>
        <p className="text-gray-600">
          You will be redirected to eSewa payment gateway.
          <br />
          Amount: <span className="font-bold text-teal-600">Rs. {order.totalPrice?.toFixed(2) || '0.00'}</span>
        </p>
        <p className="text-sm text-gray-400 mt-4">
          Order: #{order.orderNumber || order._id?.slice(-8).toUpperCase() || 'N/A'}
        </p>

        {/* ✅ eSewa v2 Form - Hidden */}
        <form 
          ref={formRef} 
          action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" 
          method="POST" 
          className="hidden"
        >
          <input type="hidden" name="amount" value={formData?.amount || order.totalPrice} />
          <input type="hidden" name="tax_amount" value={formData?.tax_amount || '0'} />
          <input type="hidden" name="total_amount" value={formData?.total_amount || order.totalPrice} />
          <input type="hidden" name="transaction_uuid" value={formData?.transaction_uuid || `txn-${Date.now()}`} />
          <input type="hidden" name="product_code" value={formData?.product_code || 'EPAYTEST'} />
          <input type="hidden" name="product_service_charge" value={formData?.product_service_charge || '0'} />
          <input type="hidden" name="product_delivery_charge" value={formData?.product_delivery_charge || '0'} />
          <input type="hidden" name="success_url" value={formData?.success_url || 'http://localhost:5173/payment-success'} />
          <input type="hidden" name="failure_url" value={formData?.failure_url || 'http://localhost:5173/payment-failure'} />
          <input type="hidden" name="signed_field_names" value={formData?.signed_field_names || 'total_amount,transaction_uuid,product_code'} />
          <input type="hidden" name="signature" value={formData?.signature || ''} />
        </form>

        <button
          onClick={() => formRef.current?.submit()}
          className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          Proceed to eSewa
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentEsewa;