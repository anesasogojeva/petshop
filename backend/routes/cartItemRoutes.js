const express = require('express');
const router = express.Router();
const cartItemController = require('../controllers/cartItemController');


router.get('/user/:userId', cartItemController.getCart); // fix: use correct handler name
router.get('/:id', cartItemController.getCartItemById);
router.post('/user/:userId', cartItemController.addToCart); // make sure route matches controller
router.delete('/:itemId', cartItemController.deleteCartItem);

module.exports = router;
