const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');
const Product = require('./Product');
const User = require('./User');

const CartItem = sequelize.define('CartItem', {
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  }
});

// Set up associations with explicit foreign keys
CartItem.belongsTo(Product, { foreignKey: 'ProductId' });
CartItem.belongsTo(User, { foreignKey: 'UserId' });

// Optionally: Also add reverse associations for completeness (if needed elsewhere)
Product.hasMany(CartItem, { foreignKey: 'ProductId' });
User.hasMany(CartItem, { foreignKey: 'UserId' });

module.exports = CartItem;
