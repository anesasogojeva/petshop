const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');
const User = require('./User');
const Pet = require('./Pet');
const Veterinarian = require('./Veterinarian');

const Record = sequelize.define('Record', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  diagnosis: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  treatment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Pets',
      key: 'id',
    },
    onDelete: 'NO ACTION',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'NO ACTION',
  },
  veterinarianId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Veterinarians',
      key: 'id',
    },
    onDelete: 'NO ACTION'  // Avoid cascading delete
  }
},{
  timestamps: true
});

// Associations
User.hasMany(Record, { foreignKey: 'userId' });
Record.belongsTo(User, { foreignKey: 'userId' });

Pet.hasMany(Record, { foreignKey: 'petId' });
Record.belongsTo(Pet, { foreignKey: 'petId' });


Veterinarian.hasMany(Record, { foreignKey: 'veterinarianId' });
Record.belongsTo(Veterinarian, { foreignKey: 'veterinarianId' });

module.exports = Record;