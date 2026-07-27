// backend/utils/emailTemplates.js

// ✅ Order Confirmation Email Template with Proper Images
const getOrderConfirmationEmail = (order, user) => {
  // Calculate totals
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = order.totalDiscount || 0;
  const deliveryFee = order.deliveryFee || 0;

  // Generate items HTML with proper image handling
  const itemsHtml = order.items.map((item, index) => {
    // Get the image URL from the item
    let imageUrl = item.coverImage || '';
    
    // Debug log to see what's happening
    console.log(`📸 Book: ${item.title}`);
    console.log(`📸 Image URL from DB: ${imageUrl}`);
    
    // If image URL is empty, use a colored placeholder with book title
    if (!imageUrl || imageUrl === '') {
      // Create a placeholder with the first letter of the book title
      const firstLetter = item.title.charAt(0).toUpperCase();
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <table style="width: 100%;">
              <tr>
                <td style="width: 70px; vertical-align: middle; text-align: center;">
                  <div style="width: 60px; height: 80px; background: linear-gradient(135deg, #14b8a6, #06b6d4); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; margin: 0 auto;">
                    ${firstLetter}
                  </div>
                </td>
                <td style="padding-left: 12px; vertical-align: middle;">
                  <strong style="color: #111827; font-size: 14px; display: block;">${item.title}</strong>
                  ${item.discount > 0 ? `<span style="color: #10b981; font-size: 12px;">🔥 ${item.discount}% off</span>` : ''}
                  <span style="color: #6b7280; font-size: 12px; display: block;">Quantity: ${item.quantity}</span>
                </td>
                <td style="text-align: right; vertical-align: middle;">
                  ${item.discount > 0 ? `<span style="color: #9ca3af; text-decoration: line-through; font-size: 12px; display: block;">Rs. ${(item.price * item.quantity).toFixed(2)}</span>` : ''}
                  <strong style="color: #111827; font-size: 16px;">Rs. ${((item.discountedPrice || item.price) * item.quantity).toFixed(2)}</strong>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }

    // For external URLs, try to display them with fallback
    // Some email clients block external images, so we use a combination of img tag with onerror
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <table style="width: 100%;">
            <tr>
              <td style="width: 70px; vertical-align: middle; text-align: center;">
                <img 
                  src="${imageUrl}" 
                  alt="${item.title}" 
                  style="width: 60px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; display: block; margin: 0 auto; max-width: 60px;"
                  onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:60px;height:80px;background:linear-gradient(135deg,#14b8a6,#06b6d4);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:24px;font-weight:bold;margin:0 auto;\\'>${item.title.charAt(0).toUpperCase()}</div>'"
                />
              </td>
              <td style="padding-left: 12px; vertical-align: middle;">
                <strong style="color: #111827; font-size: 14px; display: block;">${item.title}</strong>
                ${item.discount > 0 ? `<span style="color: #10b981; font-size: 12px;">🔥 ${item.discount}% off</span>` : ''}
                <span style="color: #6b7280; font-size: 12px; display: block;">Quantity: ${item.quantity}</span>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                ${item.discount > 0 ? `<span style="color: #9ca3af; text-decoration: line-through; font-size: 12px; display: block;">Rs. ${(item.price * item.quantity).toFixed(2)}</span>` : ''}
                <strong style="color: #111827; font-size: 16px;">Rs. ${((item.discountedPrice || item.price) * item.quantity).toFixed(2)}</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - BookShell</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f9fafb;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #14b8a6, #06b6d4);
          padding: 30px 40px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .header p {
          color: rgba(255, 255, 255, 0.9);
          margin: 8px 0 0;
          font-size: 14px;
        }
        .content {
          padding: 30px 40px;
        }
        .greeting {
          margin-bottom: 24px;
        }
        .greeting h2 {
          color: #111827;
          margin: 0 0 8px;
          font-size: 22px;
        }
        .greeting p {
          color: #6b7280;
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
        }
        .status-badge {
          display: inline-block;
          background-color: #d1fae5;
          color: #065f46;
          padding: 4px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin: 8px 0 16px;
        }
        .order-details {
          background-color: #f9fafb;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }
        .order-details-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
          border-bottom: 1px solid #e5e7eb;
        }
        .order-details-row:last-child {
          border-bottom: none;
        }
        .order-details-label {
          color: #6b7280;
        }
        .order-details-value {
          color: #111827;
          font-weight: 500;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        .items-table th {
          text-align: left;
          padding: 12px;
          background-color: #f9fafb;
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e5e7eb;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #f3f4f6;
        }
        .summary {
          background-color: #f9fafb;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
        }
        .summary-total {
          display: flex;
          justify-content: space-between;
          padding: 12px 0 0;
          border-top: 2px solid #e5e7eb;
          margin-top: 6px;
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        }
        .footer {
          background-color: #f9fafb;
          padding: 24px 40px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer .brand {
          color: #14b8a6;
          font-weight: 600;
          font-size: 18px;
        }
        .footer .tagline {
          color: #6b7280;
          font-size: 13px;
          margin: 4px 0;
        }
        .footer .contact-info {
          color: #6b7280;
          font-size: 13px;
          margin: 6px 0;
          line-height: 1.8;
        }
        .footer .contact-info strong {
          color: #374151;
        }
        .footer .contact-info a {
          color: #14b8a6;
          text-decoration: none;
        }
        .footer .contact-info a:hover {
          text-decoration: underline;
        }
        .footer .copyright {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 12px;
        }
        .divider {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 24px 0;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #14b8a6, #06b6d4);
          color: #ffffff;
          padding: 12px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          margin: 8px 0;
        }
        .btn:hover {
          opacity: 0.9;
        }
        @media only screen and (max-width: 600px) {
          .content { padding: 20px; }
          .header { padding: 20px; }
          .footer { padding: 20px; }
          .items-table td { padding: 8px; }
          .items-table td table tr td { display: block; text-align: center; }
          .items-table td table tr td:first-child { margin: 0 auto; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>📚 BookShell</h1>
          <p>Your Order Has Been Confirmed! 🎉</p>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Greeting -->
          <div class="greeting">
            <h2>Thank You, ${user.firstName || 'Customer'}! 👋</h2>
            <p>We're excited to let you know that we've received your order and it's being processed. You'll receive another email when your order ships.</p>
            <div class="status-badge">✅ Payment Confirmed</div>
          </div>

          <!-- Order Details -->
          <div class="order-details">
            <div class="order-details-row">
              <span class="order-details-label">Order Number</span>
              <span class="order-details-value">#${order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div class="order-details-row">
              <span class="order-details-label">Order Date</span>
              <span class="order-details-value">${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="order-details-row">
              <span class="order-details-label">Payment Method</span>
              <span class="order-details-value">${order.paymentMethod.toUpperCase()}</span>
            </div>
            <div class="order-details-row">
              <span class="order-details-label">Payment Status</span>
              <span class="order-details-value" style="color: #10b981; font-weight: 600;">✅ Confirmed</span>
            </div>
            <div class="order-details-row">
              <span class="order-details-label">Order Status</span>
              <span class="order-details-value" style="color: #f59e0b; font-weight: 600;">⏳ Pending</span>
            </div>
          </div>

          <!-- Shipping Address -->
          <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px;">Shipping Address</h3>
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
            <p style="margin: 0; color: #111827; font-weight: 500;">${order.shippingAddress.fullName}</p>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">${order.shippingAddress.address}</p>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">${order.shippingAddress.city}</p>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">${order.shippingAddress.phone}</p>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">${order.shippingAddress.email}</p>
          </div>

          <!-- Items -->
          <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px;">Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Summary -->
          <div class="summary">
            <div class="summary-row">
              <span style="color: #6b7280;">Subtotal</span>
              <span style="color: #111827;">Rs. ${subtotal.toFixed(2)}</span>
            </div>
            ${discount > 0 ? `
            <div class="summary-row">
              <span style="color: #10b981;">Discount</span>
              <span style="color: #10b981;">- Rs. ${discount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="summary-row">
              <span style="color: #6b7280;">Delivery Fee</span>
              <span style="color: #111827;">Rs. ${deliveryFee.toFixed(2)}</span>
            </div>
            <div class="summary-total">
              <span>Total</span>
              <span>Rs. ${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <hr class="divider" />

          <!-- Track Order Button -->
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-orders" class="btn">📦 Track Your Order</a>
            <p style="color: #6b7280; font-size: 12px; margin-top: 12px;">
              Your order will be processed within 24 hours during working days.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p class="brand">📚 BookShell</p>
          <p class="tagline">Your trusted online bookstore</p>
          <div class="contact-info">
            <strong>📍 Address:</strong> Bhaktapur, Nepal<br>
            <strong>📞 Phone:</strong> <a href="tel:+9779745969254">+977 9745969254</a><br>
            <strong>✉️ Email:</strong> <a href="mailto:info@bookshell.com">info@bookshell.com</a>
          </div>
          <p class="copyright">© ${new Date().getFullYear()} BookShell. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ✅ Order Status Update Email Template
const getOrderStatusUpdateEmail = (order, user, oldStatus, newStatus) => {
  const statusMessages = {
    pending: 'Your order is pending and will be processed soon.',
    shipped: 'Your order has been shipped and is on its way! 🚚',
    delivered: 'Your order has been delivered. Enjoy your books! 📚',
    cancelled: 'Your order has been cancelled. If this was a mistake, please contact support.'
  };

  const statusColors = {
    pending: '#f59e0b',
    shipped: '#3b82f6',
    delivered: '#10b981',
    cancelled: '#ef4444'
  };

  const statusEmojis = {
    pending: '⏳',
    shipped: '🚚',
    delivered: '✅',
    cancelled: '❌'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update - BookShell</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f9fafb;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #14b8a6, #06b6d4);
          padding: 30px 40px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
        }
        .header p {
          color: rgba(255,255,255,0.9);
          margin: 4px 0 0;
        }
        .content {
          padding: 30px 40px;
        }
        .greeting h2 {
          color: #111827;
          margin: 0 0 8px;
          font-size: 22px;
        }
        .greeting p {
          color: #6b7280;
          margin: 0 0 16px;
          font-size: 14px;
        }
        .status-badge {
          display: inline-block;
          background-color: ${statusColors[newStatus] || '#6b7280'};
          color: #ffffff;
          padding: 8px 24px;
          border-radius: 20px;
          font-size: 16px;
          font-weight: 600;
          margin: 8px 0 16px;
        }
        .status-update {
          background-color: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          margin: 16px 0;
          text-align: center;
        }
        .status-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 8px 0;
          flex-wrap: wrap;
        }
        .old-status {
          color: #6b7280;
          font-size: 16px;
          font-weight: 500;
        }
        .arrow {
          font-size: 24px;
          color: #9ca3af;
        }
        .new-status {
          color: ${statusColors[newStatus] || '#6b7280'};
          font-weight: 700;
          font-size: 20px;
        }
        .status-message {
          color: #6b7280;
          font-size: 14px;
          margin-top: 12px;
        }
        .order-info {
          background-color: #f9fafb;
          border-radius: 12px;
          padding: 16px 20px;
          margin: 16px 0;
        }
        .order-info-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 14px;
        }
        .order-info-label {
          color: #6b7280;
        }
        .order-info-value {
          color: #111827;
          font-weight: 500;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #14b8a6, #06b6d4);
          color: #ffffff;
          padding: 12px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          margin: 8px 0;
        }
        .btn:hover {
          opacity: 0.9;
        }
        .footer {
          background-color: #f9fafb;
          padding: 24px 40px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer .brand {
          color: #14b8a6;
          font-weight: 600;
          font-size: 18px;
        }
        .footer .tagline {
          color: #6b7280;
          font-size: 13px;
          margin: 4px 0;
        }
        .footer .contact-info {
          color: #6b7280;
          font-size: 13px;
          margin: 6px 0;
          line-height: 1.8;
        }
        .footer .contact-info strong {
          color: #374151;
        }
        .footer .contact-info a {
          color: #14b8a6;
          text-decoration: none;
        }
        .footer .contact-info a:hover {
          text-decoration: underline;
        }
        .footer .copyright {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 12px;
        }
        .divider {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 20px 0;
        }
        @media only screen and (max-width: 600px) {
          .content { padding: 20px; }
          .header { padding: 20px; }
          .footer { padding: 20px; }
          .status-arrow { flex-direction: column; gap: 8px; }
          .arrow { transform: rotate(90deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 BookShell</h1>
          <p>Order Status Update</p>
        </div>
        <div class="content">
          <div class="greeting">
            <h2>Hello ${user.firstName || 'Customer'}! 👋</h2>
            <p>Your order status has been updated:</p>
          </div>
          
          <div style="text-align: center;">
            <div class="status-badge">${statusEmojis[newStatus]} ${newStatus.toUpperCase()}</div>
          </div>
          
          <div class="status-update">
            <div class="status-arrow">
              <span class="old-status">${oldStatus.toUpperCase()}</span>
              <span class="arrow">→</span>
              <span class="new-status">${newStatus.toUpperCase()}</span>
            </div>
            <div class="status-message">
              ${statusMessages[newStatus] || 'Your order status has been updated.'}
            </div>
          </div>

          <div class="order-info">
            <div class="order-info-row">
              <span class="order-info-label">Order Number</span>
              <span class="order-info-value">#${order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div class="order-info-row">
              <span class="order-info-label">Order Date</span>
              <span class="order-info-value">${new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="order-info-row">
              <span class="order-info-label">Total Amount</span>
              <span class="order-info-value">Rs. ${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <hr class="divider" />

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-orders" class="btn">📦 View My Orders</a>
          </div>
        </div>
        <div class="footer">
          <p class="brand">📚 BookShell</p>
          <p class="tagline">Your trusted online bookstore</p>
          <div class="contact-info">
            <strong>📍 Address:</strong> Bhaktapur, Nepal<br>
            <strong>📞 Phone:</strong> <a href="tel:+9779745969254">+977 9745969254</a><br>
            <strong>✉️ Email:</strong> <a href="mailto:info@bookshell.com">info@bookshell.com</a>
          </div>
          <p class="copyright">© ${new Date().getFullYear()} BookShell. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getOrderConfirmationEmail,
  getOrderStatusUpdateEmail
};