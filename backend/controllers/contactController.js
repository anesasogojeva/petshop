const Contact = require('../models/contactModel');

// Create a contact message
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = await Contact.create({ name, email, message });
    res.status(201).json(contact);
  } catch (err) {
    console.error('❌ Error while creating contact:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get all messages, newest first
exports.getMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ _id: -1 }); // newest first
    res.status(200).json(messages);
  } catch (err) {
    console.error('❌ Error while fetching messages:', err.message);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};

