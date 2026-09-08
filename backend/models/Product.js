const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  discount: {
    type: DataTypes.FLOAT, // e.g., 0.15 for 15%
    defaultValue: 0,
  },
  category: {
    type: DataTypes.ENUM('pet food', 'toys', 'clothes'),
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = Product;
