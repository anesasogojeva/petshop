const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');
const User = require('./User');

const Veterinarian = sequelize.define('Veterinarian', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  specialization: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  yearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

// Relationships
User.hasOne(Veterinarian, { foreignKey: 'userId', onDelete: 'CASCADE' });
Veterinarian.belongsTo(User, { foreignKey: 'userId' });

module.exports = Veterinarian;