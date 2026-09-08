const express = require('express');
const { register, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/register', register);
// router.get('/',authenticateToken, authorizeRole(['admin','user','veterinarian']), getAllUsers);
router.get('/',authenticateToken, getAllUsers);
router.get('/:id', getUserById);
router.put('/:id',authenticateToken, authorizeRole(['admin']), updateUser);
router.delete('/:id',authenticateToken, authorizeRole(['admin']), deleteUser);

module.exports = router;
