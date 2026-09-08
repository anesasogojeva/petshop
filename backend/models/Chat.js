const mongoose = require('mongoose');
const chatSchema = mongoose.Schema({
  chatName: { type: String },
  isGroupChat: { type: Boolean, default: false },
  users: [{ type: Number }],  // or ideally type: mongoose.Schema.Types.ObjectId ref: 'User'
  createdBy: Number, 
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);