const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');
const User = require('./User');

const Order = sequelize.define('Order', {
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  userId: {  // Add userId to link the order to a user
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',  // Make sure 'Users' matches the name of your User table
      key: 'id',
    },
    onDelete: 'NO ACTION',  // Avoid cascading delete
  }
}, {
  timestamps: true,
});

// Define the associations
User.hasMany(Order, { foreignKey: 'userId' }); // User can have many orders
Order.belongsTo(User, { foreignKey: 'userId' }); // Each order belongs to one user

module.exports = Order;
