console.log('📨 contactRoutes loaded');
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/', contactController.sendMessage);
router.get('/',authenticateToken, authorizeRole(['admin']),contactController.getMessages);

module.exports = router;