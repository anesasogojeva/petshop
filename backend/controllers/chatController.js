const Chat = require('../models/Chat');
const User = require('../models/User'); // Sequelize User model

// exports.accessChat = async (req, res) => {
//   const currentUserId = Number(req.user.id);
//   const otherUserId = Number(req.body.userId);

//   if (!otherUserId) {
//     return res.status(400).send('UserId param not sent with request');
//   }

//   try {
//     let chat = await Chat.findOne({
//       isGroupChat: false,
//       users: { $all: [currentUserId, otherUserId] }
//     });

//     if (chat) {
//       return res.status(200).json(chat);
//     }

//     // Create new chat
//     const chatData = {
//       chatName: 'sender',
//       isGroupChat: false,
//       users: [currentUserId, otherUserId],
//       createdBy: currentUserId
//     };

//     const createdChat = await Chat.create(chatData);
//     const fullChat = await Chat.findById(createdChat._id).populate('latestMessage');

//     res.status(200).json(fullChat);

//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: error.message });
//   }
// };

exports.accessChat = async (req, res) => {
  const { userId, userId2 } = req.body;

  if (!userId || !userId2) {
    return res.status(400).json({ message: 'Missing userId or userId2' });
  }

  try {
    // Find a chat that includes both users, no more no less
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [userId, userId2], $size: 2 }
    });

    if (!chat) {
      chat = await Chat.create({
        chatName: 'Private Chat',
        users: [userId, userId2],
        createdBy: userId
      });
    }

    res.status(200).json(chat);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChats = async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const chats = await Chat.find({ users: Number(currentUserId) })
  .populate('latestMessage')
  .sort({ updatedAt: -1 });


    res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};