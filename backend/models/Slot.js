const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');
const User = require('./User');  // import User model instead of Veterinarian

const Slot = sequelize.define('Slot', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {  // changed from veterinarianId to userId
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'NO ACTION',
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isBooked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  timestamps: false,
});

// Update associations
User.hasMany(Slot, { foreignKey: 'userId' });
Slot.belongsTo(User, { foreignKey: 'userId' });

module.exports = Slot;