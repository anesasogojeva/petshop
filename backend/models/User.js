const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.ENUM('admin', 'user', 'veterinarian'),
    defaultValue: 'user'
  },

  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  confirmationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  tokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  }

}, {
  timestamps: true
});

User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  console.log('Hashed password during registration:', user.password);
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

module.exports = User;
