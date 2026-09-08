const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/', productController.getAllProducts);
// router.get('/:id', productController.getProductById);
router.post('/', authenticateToken, authorizeRole(['admin']) ,productController.createProduct);
router.put('/:id',  authenticateToken, authorizeRole(['admin']),productController.updateProduct);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), productController.deleteProduct);
router.get('/filter', productController.getFilteredProducts);

module.exports = router;
