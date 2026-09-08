const messageRouter = require("express").Router();
const messageController = require("../controllers/messageController");
const { authenticateToken } = require("../middleware/authMiddleware");

messageRouter.post("/", authenticateToken, messageController.sendMessage);
messageRouter.get("/:chatId", authenticateToken, messageController.allMessages);

module.exports = messageRouter;