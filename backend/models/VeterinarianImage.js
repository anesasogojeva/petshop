const mongoose = require('mongoose');

const veterinarianImageSchema = new mongoose.Schema(
  {
    veterinarianId: {                
      type: Number,
      required: true,
      index: true,
    },
    url: {                      
      type: String,
      required: true,
    },
    isPrimary: {        
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VeterinarianImage', veterinarianImageSchema);