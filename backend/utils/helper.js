// backend/utils/helper.js
const crypto = require('crypto');

function generateUniqueId() {
  return `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateHmacSha256Hash(data, secret) {
  if (!data || !secret) {
    console.warn('⚠️ Missing data or secret for hash generation');
    return '';
  }
  try {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64');
    return hash;
  } catch (error) {
    console.error('❌ Hash generation error:', error);
    return '';
  }
}

module.exports = {
  generateUniqueId,
  generateHmacSha256Hash
};