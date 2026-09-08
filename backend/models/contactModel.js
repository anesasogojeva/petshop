const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true
  }
}, {
  collection: 'Contacts', 
  timestamps: false       
});

module.exports = mongoose.model('Contact', ContactSchema);
