const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

router.post("/", authenticateToken, chatController.accessChat);
router.get("/", authenticateToken, chatController.getChats);

module.exports = router;