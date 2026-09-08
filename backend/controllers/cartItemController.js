const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const { Op } = require('sequelize');


exports.getCart = async (req, res) => {
  try {
    const cart = await CartItem.findAll({ where: { UserId: req.params.userId }, include: Product });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.params.userId;

  const transaction = await CartItem.sequelize.transaction();

  try {
    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Product not found' });
    }

    // Check if the item already exists in the cart
    const existingItem = await CartItem.findOne({
      where: { ProductId: productId, UserId: userId },
      transaction
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save({ transaction });
      await transaction.commit();
      return res.status(200).json(existingItem);
    }

    // Create new cart item if not already in cart
    const item = await CartItem.create(
      { ProductId: productId, quantity, UserId: userId },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json(item);

  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};


exports.getCartItemById = async (req, res) => {
  try {
    const item = await CartItem.findByPk(req.params.id, {include: Product});
    if (!item) return res.status(404).json({ error: 'Cart item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart item' });
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const deleted = await CartItem.destroy({ where: { id: req.params.itemId } });
    if (!deleted) return res.status(404).json({ error: 'Cart item not found' });
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
};
