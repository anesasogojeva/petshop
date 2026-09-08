const Order = require('../models/Order');
const Product = require('../models/Product');
const OrderItem = require('../models/OrderItem');
const { Op } = require('sequelize');

exports.getAllOrderItemsForUser = async (req, res) => {
  const userId = req.params.userId;  

  try {
    const orders = await Order.findAll({
      where: { userId },
      include: {
        model: OrderItem,
        include: Product,  
      },
    });

    if (orders.length === 0) {
      return res.status(404).json({ error: 'No orders found for this user' });
    }

    const orderItems = orders.flatMap(order => order.OrderItems);

    res.status(200).json(orderItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
};

exports.deleteOrderItem = async (req, res) => {
  const { orderItemId } = req.params;

  try {
    const orderItem = await OrderItem.findByPk(orderItemId);

    if (!orderItem) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    await orderItem.destroy();
    res.status(200).json({ message: 'Order item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete order item' });
  }
};

// exports.addOrderItem = async (req, res) => {
//   const { orderId, productId, quantity } = req.body;

//   try {
//     // Check if the order exists
//     const order = await Order.findByPk(orderId);
//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     // Check if the product exists
//     const product = await Product.findByPk(productId);
//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     // Create the new order item
//     const newOrderItem = await OrderItem.create({
//       orderId,
//       productId,
//       quantity,
//       priceAtPurchase: product.price,  // You might want to store the price at purchase
//     });

//     res.status(201).json(newOrderItem);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to add order item' });
//   }
// };
