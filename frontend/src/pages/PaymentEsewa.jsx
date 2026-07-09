import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentEsewa = () => {
  const formRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  useEffect(() => {
    if (!order) {
      navigate('/cart');
      return;
    }
    
    if (formRef.current) {
      formRef.current.submit();
    }
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-xl text-gray-700 mb-4">Redirecting to eSewa...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
      </div>
      
     
      <form ref={formRef} action="https://uat.esewa.com.np/epayment/payStart" method="POST" className="hidden">
        <input type="hidden" name="amt" value={order.totalPrice} />
        <input type="hidden" name="pdc" value={0} />
        <input type="hidden" name="txAmt" value={0} />
        <input type="hidden" name="tAmt" value={order.totalPrice} />
        <input type="hidden" name="pid" value={order.orderNumber} />
        <input type="hidden" name="scd" value="EPAYTEST" /> {/* eSewa Merchant ID */}
        <input type="hidden" name="su" value={`${window.location.origin}/payment/esewa/success`} />
        <input type="hidden" name="fu" value={`${window.location.origin}/payment/esewa/failure`} />
      </form>
    </div>
  );
};

export default PaymentEsewa;