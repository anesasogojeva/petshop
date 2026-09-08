const mongoose = require('mongoose');

const PetImage = new mongoose.Schema({
  petId: {
    type: Number, // Sequelize's pet id
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
    isPrimary: {        
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true });

module.exports=mongoose.model('PetImage', PetImage);