const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/mailService');
const sequelize = require('../config/dbConfig');
const User = require('../models/User');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

router.post('/confirm-email', async (req, res) => {
  console.log('📩 /confirm-email called with body:', req.body);

  const userId = Number(req.body.userId);


  if (!userId) {
    console.log('❌ Missing userId in request body');
    return res.status(400).json({ error: 'Missing userId in request body' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      console.log(`❌ User not found for userId: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch user's cart items with product details
    const cartItems = await CartItem.findAll({
      where: { UserId: userId },
      include: [{ model: Product }]
    });

    if (!cartItems.length) {
      console.log(`❌ No cart items found for userId: ${userId}`);
      return res.status(400).json({ error: 'No cart items found' });
    }

    // Generate itemized HTML table
    const itemsHtml = cartItems.map(item => {
      const product = item.Product;
      const originalPrice = product.price;
      const discountedPrice = originalPrice * (1 - product.discount);
      const subtotal = (discountedPrice * item.quantity).toFixed(2);

      return `
        <tr>
          <td>${product.name}</td>
          <td>${item.quantity}</td>
          <td>$${discountedPrice.toFixed(2)}</td>
          <td>$${subtotal}</td>
        </tr>
      `;
    }).join('');

    const total = cartItems.reduce((sum, item) => {
      const p = item.Product;
      return sum + (p.price * (1 - p.discount)) * item.quantity;
    }, 0).toFixed(2);

    console.log(`📧 Sending email to ${user.email} with total $${total}`);

    // Persist the order now that payment has succeeded, before it's lost when the cart clears
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.create(
        { userId, totalAmount: parseFloat(total), status: 'completed' },
        { transaction }
      );

      for (const item of cartItems) {
        const discountedPrice = item.Product.price * (1 - (item.Product.discount || 0));
        await OrderItem.create(
          {
            orderId: order.id,
            productId: item.Product.id,
            quantity: item.quantity,
            priceAtPurchase: discountedPrice,
          },
          { transaction }
        );
      }

      await transaction.commit();
      console.log(`🧾 Order ${order.id} created for userId:`, userId);
    } catch (orderErr) {
      await transaction.rollback();
      console.error('❌ Failed to create order record:', orderErr);
    }

    // Clear the cart and respond right away - the receipt email is best-effort
    // and must never block or fail the response for an already-completed order.
    await CartItem.destroy({ where: { UserId: userId } });
    console.log('🗑️ Cart cleared for userId:', userId);
    res.status(200).json({ message: 'Order recorded' });

    try {
      await sendEmail(
      user.email,
      '🧾 Your Pet Care Order Receipt',
      'Here is a summary of your recent order.',
      `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background:rgb(255, 255, 255);
        padding: 20px;
      }
      .email-container {
        max-width: 600px;
        margin: auto;
        background: #FFFFFF;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .header {
        font-size: 26px;
        color: #C58177;
        margin-bottom: 20px;
        text-align: center;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      th {
        background: #FAD1D8;
        color: #333;
        padding: 12px;
        border: 1px solid #F9B5C5;
        text-align: left;
      }
      td {
        padding: 10px;
        border: 1px solid #FAD1D8;
        text-align: left;
      }
      .total {
        font-weight: bold;
        color: #C58177;
      }
      .footer {
        font-size: 12px;
        color: #A67B8B;
        text-align: center;
        margin-top: 20px;
      }
      p {
        color: #333;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">Thank you for your order, ${user.name || 'Customer'}! 🐾</div>
      <p>Here's your receipt:</p>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td colspan="3" class="total">Total</td>
            <td class="total">$${total}</td>
          </tr>
        </tbody>
      </table>
      <p>We’ll notify you once your items are on the way!</p>
      <div class="footer">❤️ The Pet Care Team</div>
    </div>
  </body>
  </html>
  `
      );
      console.log('✅ Email sent successfully');
    } catch (emailErr) {
      console.error('❌ Failed to send receipt email (order was still recorded):', emailErr);
    }

  } catch (error) {
    console.error('❌ Error sending receipt email:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to send receipt email' });
    }
  }
});

module.exports = router;