const sequelize = require('../config/dbConfig');
const Order = require('../models/Order');
const User = require('../models/User');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const OrderItem = require('../models/OrderItem');


/*exports.createOrder = async (req, res) => {
  const userId = req.params.userId;

 const transaction = await CartItem.sequelize.transaction(); // ❌ `CartItem.sequelize` might be undefined


  try {
    // Get cart items for the user
    const cartItems = await CartItem.findAll({
      where: { userId: userId },
      include: Product,
      transaction
    });

    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Cart is empty. Cannot create order.' });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      return total + item.quantity * item.Product.price;
    }, 0);

    // Create order
    const order = await Order.create(
      {
        userId,
        totalAmount
      },
      { transaction }
    );

    // Clear cart
    await CartItem.destroy({ where: { UserId: userId }, transaction });

    await transaction.commit();

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};  */


exports.createOrder = async (req, res) => {
  const userId = req.params.userId;

  const transaction = await CartItem.sequelize.transaction();

  try {
    // Get cart items with product info
    const cartItems = await CartItem.findAll({
      where: { userId: userId },
      include: Product,
      transaction,
    });

    if (cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Cart is empty. Cannot create order.' });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      return total + item.quantity * item.Product.price;
    }, 0);

    // Create the order
    const order = await Order.create(
      {
        userId,
        totalAmount,
      },
      { transaction }
    );

    // Create order items based on cart items
    for (const item of cartItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.Product.id,
          quantity: item.quantity,
          priceAtPurchase: item.Product.price,
        },
        { transaction }
      );
    }

    // Clear the cart
    // await CartItem.destroy({
    //   where: { userId: userId },
    //   transaction,
    // });

    await transaction.commit();
    res.status(201).json({ message: 'Order created successfully', orderId: order.id });

  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
     const orders = await Order.findAll({
      include: {
        model: User,
        attributes: ['id', 'name', 'email'] 
      }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: {
        model: User,
        attributes: ['id', 'name', 'email'] 
      }});

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};



// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Order not found' });

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

exports.getOrderDetails = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};