const express = require('express');
const router = express.Router();
const {
  createPetLog,
  getPetLogs,
  updatePetLog,
  deletePetLog
} = require('../controllers/PetLogController');

const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// router.post('/:petId', authenticateToken, authorizeRole('user'), createPetLog);
// router.get('/:petId', authenticateToken, authorizeRole('user'), getPetLogs);
// router.put('/:petId/:logId', authenticateToken, authorizeRole('user'), updatePetLog);
// router.delete('/:petId/:logId', authenticateToken, authorizeRole('user'), deletePetLog);

router.post('/:petId', createPetLog);
router.get('/:petId', getPetLogs);

router.put('/:petId/:logId', updatePetLog);
router.delete('/:petId/:logId', deletePetLog);

module.exports = router;