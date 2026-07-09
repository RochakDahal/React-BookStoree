import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const EsewaSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const oid = searchParams.get('oid'); 
      const amt = searchParams.get('amt'); 
      const refId = searchParams.get('refId'); 

      if (!oid || !refId) {
        navigate('/payment/esewa/failure');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        await axios.get(`http://localhost:5000/api/payments/esewa/verify?oid=${oid}&amt=${amt}&refId=${refId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Clear cart and redirect to success page
        navigate('/order-success', { state: { orderId: oid } });
      } catch (error) {
        navigate('/payment/esewa/failure');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (verifying) return <LoadingSpinner fullScreen />;
  return null;
};

export default EsewaSuccess;