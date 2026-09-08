const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema(
  {
    productId: {                 
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

module.exports = mongoose.model('ProductImage', productImageSchema);