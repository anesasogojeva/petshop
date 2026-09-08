const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');
const User = require('./User');
const Pet = require('./Pet');
const Veterinarian = require('./Veterinarian');
const Slot = require('./Slot');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reason: {
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
    onDelete: 'NO ACTION',
  },
  slotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Slots',
      key: 'id',
    },
    onDelete: 'NO ACTION',
  }
}, {
  timestamps: true,
});

// Associations
User.hasMany(Appointment, { foreignKey: 'userId' });
Appointment.belongsTo(User, { foreignKey: 'userId' });

Pet.hasMany(Appointment, { foreignKey: 'petId' });
Appointment.belongsTo(Pet, { foreignKey: 'petId' });

Veterinarian.hasMany(Appointment, { foreignKey: 'veterinarianId' });
Appointment.belongsTo(Veterinarian, { foreignKey: 'veterinarianId' });

Slot.hasOne(Appointment, { foreignKey: 'slotId' });
Appointment.belongsTo(Slot, { foreignKey: 'slotId' });

module.exports = Appointment;
