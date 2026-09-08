const express = require('express');
const router = express.Router();
const adoptionController = require('../controllers/adoptionController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, authorizeRole(['admin',  'user']),adoptionController.createAdoption);
router.get('/my-adoptions', authenticateToken,authorizeRole(['admin',  'user']), adoptionController.getMyAdoptions);
router.get('/', authenticateToken, authorizeRole('admin'), adoptionController.getAllAdoptions);
router.delete('/:id', authenticateToken,authorizeRole(['admin',  'user']), adoptionController.deleteAdoption);
router.put('/:id', authenticateToken,authorizeRole(['admin']), adoptionController.updateAdoption);
router.get('/user/:userId', authenticateToken,authorizeRole(['admin',  'veterinarian','user']), adoptionController.getAdoptionsByUser);


module.exports = router;