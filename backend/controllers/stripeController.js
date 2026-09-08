const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailService');

exports.createCheckoutSession = async (req, res) => {
  const { userId } = req.params;

  try {
    const cartItems = await CartItem.findAll({
      where: { UserId: userId },
      include: [{
        model: Product,
        attributes: ['name', 'description', 'price', 'discount']
      }]

    });

    if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const line_items = cartItems.map(item => {
      const price = item.Product.price;
      const discount = item.Product.discount || 0;
      const discountedPrice = price * (1 - discount); // Make sure it's divided by 100
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.Product.name,
            description: item.Product.description,
          },
          unit_amount: Math.round(discountedPrice * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      };
    });


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
    const discountedTotal = cartItems.reduce((acc, item) => {
      const price = item.Product.price;
      const discount = item.Product.discount || 0;
      const discountedPrice = price * (1 - discount);
      return acc + discountedPrice * item.quantity;
    }, 0).toFixed(2);

    // Optional early email (not recommended for final confirmation)
    await sendEmail(
      user.email,
      '🧾 Your Pet Care Order is Being Processed',
      'Your checkout has started.',
      `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color:rgb(255, 255, 255);
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 30px;
      text-align: center;
    }
    .header {
      font-size: 26px;
      color: #C58177;
      margin-bottom: 10px;
    }
    .logo {
      width: 50px;
      height: 50px;
      margin-bottom: 10px;
    }
    .content {
      font-size: 16px;
      color: #333333;
      margin-bottom: 20px;
    }
    .total {
      font-size: 20px;
      color: #C58177;
      font-weight: bold;
      margin: 10px 0 20px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #C58177;
      color: #FFFFFF;
      text-decoration: none;
      font-size: 16px;
      border-radius: 6px;
      transition: background-color 0.3s ease;
      margin-top: 10px;
    }
    .button:hover {
      background-color: #b06f66;
    }
    .footer {
      font-size: 12px;
      color: #A67B8B;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <img src="cid:pawlogo" alt="Paw Logo" class="logo" />
    <div class="header">Pet Care App</div>
    <div class="content">
      Thank you for your order! You’re about to complete your payment.
    </div>
    <div class="total">
      Order Total: $${discountedTotal}
    </div>

    <a href="#" class="button">We'll Send You Order Details</a>

    <div class="footer">
      You’ll receive another email once your payment is complete. ❤️<br />
      Pet Care Team
    </div>
  </div>
</body>
</html>
  `
    );




    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create Stripe session' });
  }
};
