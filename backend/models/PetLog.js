const mongoose = require('mongoose');

const petLogSchema = new mongoose.Schema({
  petId: {
    type: Number, // Matching SQL Pet ID
    required: true,
  },
  logs: [
    {
      date: { type: Date, default: Date.now },
      note: { type: String, required: true }
    }
  ]
});

const PetLog = mongoose.model('PetLog', petLogSchema);

module.exports = PetLog;