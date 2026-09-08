const express = require('express');
const {
  createPet,
  getAllPets,
  getPetById,
  updatePet,
  deletePet
} = require('../controllers/petController');

const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, authorizeRole(['admin','user']),createPet);
router.get('/',getAllPets);
router.get('/:id', authenticateToken, authorizeRole(['admin']),getPetById);
router.put('/:id',authenticateToken,authorizeRole(['admin']), updatePet);
router.delete('/:id',authenticateToken, authorizeRole(['admin']), deletePet);


module.exports = router;