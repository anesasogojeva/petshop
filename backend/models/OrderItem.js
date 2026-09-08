const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');
const Product = require('./Product');
const Order = require('./Order');

const OrderItem = sequelize.define('OrderItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priceAtPurchase: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
});

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' }); 
OrderItem.belongsTo(Product, { foreignKey: 'productId' }); 

module.exports = OrderItem;
