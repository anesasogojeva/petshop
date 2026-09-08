const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Pet = sequelize.define('Pet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  breed: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  }, gender: {
    type: DataTypes.ENUM('female', 'male'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('cat', 'dog', 'bird', 'turtle', 'other'),
    allowNull: false
  },
  adopted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Pet;