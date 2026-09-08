const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: Number, required: true }, // MSSQL User ID
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    readBy: [{ type: Number }], // MSSQL User IDs
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);