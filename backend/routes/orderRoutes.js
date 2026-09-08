const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');


// router.get('/:id', orderController.getOrderById);
// router.post('/:id', orderController.createOrder);
// router.delete('/:id', orderController.deleteOrder);

router.post('/:userId',authenticateToken,authorizeRole(['admin',  'veterinarian','user']), orderController.createOrder);
router.get('/',authenticateToken,authorizeRole(['admin',  'veterinarian','user']), orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.delete('/:id', orderController.deleteOrder);
router.get('/item/:orderId', orderController.getOrderDetails); //get order details

module.exports = router;
