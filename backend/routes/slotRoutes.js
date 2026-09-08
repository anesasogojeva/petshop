const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Protect routes with auth middleware as needed

router.post('/create',authenticateToken,authorizeRole(['admin',  'veterinarian']), slotController.createSlotsForDate);
router.get('/available', authenticateToken,authorizeRole(['admin',  'veterinarian','user']),slotController.getAvailableSlots);
router.patch('/book/:slotId', slotController.bookSlot);
router.patch('/unbook/:slotId', slotController.unbookSlot);

module.exports = router;
