// backend/utils/esewaHelper.js
const crypto = require('crypto');

/**
 * Generate HMAC-SHA256 signature for eSewa v2
 */
function generateEsewaSignature({ amount, transaction_uuid, product_code }) {
  const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
  const dataString = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(dataString)
    .digest('base64');
  
  return signature;
}

/**
 * Get eSewa payment form data
 */
function getEsewaPaymentData({ amount, transaction_uuid, successUrl, failureUrl }) {
  const productCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
  const signature = generateEsewaSignature({
    amount,
    transaction_uuid,
    product_code: productCode
  });

  return {
    amount: amount.toString(),
    tax_amount: '0',
    total_amount: amount.toString(),
    transaction_uuid: transaction_uuid,
    product_code: productCode,
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: successUrl || `${process.env.FRONTEND_URL}/payment-success`,
    failure_url: failureUrl || `${process.env.FRONTEND_URL}/payment-failure`,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    signature: signature
  };
}

module.exports = {
  generateEsewaSignature,
  getEsewaPaymentData
};