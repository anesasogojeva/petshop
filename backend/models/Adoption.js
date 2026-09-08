// models/Adoption.js
const { DataTypes, Sequelize  } = require('sequelize');
const sequelize = require('../config/dbConfig');
const User = require('./User');
const Pet = require('./Pet');

const Adoption = sequelize.define('Adoption', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  adoptionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'NO ACTION'
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // This ensures a pet can be adopted by only one user
    references: {
      model: 'Pets',
      key: 'id',
    },
    onDelete: 'NO ACTION'
  }
}, {
  timestamps: true
});

// Associations
User.hasMany(Adoption, { foreignKey: 'userId' });
Adoption.belongsTo(User, { foreignKey: 'userId' });

Pet.hasOne(Adoption, { foreignKey: 'petId' });
Adoption.belongsTo(Pet, { foreignKey: 'petId' });



module.exports = Adoption;
