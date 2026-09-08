// routes/orderItemRoutes.js
const express = require('express');
const router = express.Router();
const orderItemController = require('../controllers/orderItemController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/user/:userId',authenticateToken,authorizeRole(['admin',  'veterinarian','user']), orderItemController.getAllOrderItemsForUser);
router.delete('/:orderItemId', orderItemController.deleteOrderItem);
// router.post('/', orderItemController.addOrderItem);


module.exports = router;
