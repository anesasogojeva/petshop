const Message = require('../models/Message');
const Chat = require('../models/Chat');

exports.allMessages = async (req, res) => {
  const chatId = req.params.chatId;

  if (!chatId) {
    return res.status(400).send('Chat ID is required');
  }

  try {
    const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
exports.sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).send('Invalid data passed into request');
  }

  try {
    const newMessage = await Message.create({
  sender: Number(req.user.id),
  content,
  chat: chatId,
  readBy: [Number(req.user.id)],
});


    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

    res.status(200).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};