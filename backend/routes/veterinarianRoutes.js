const express = require('express');
const router = express.Router();
const VeterinarianController = require('../controllers/veterinarianController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Get all veterinarians — admin or vet
router.get('/', VeterinarianController.getAllVeterinarians);

// Get a single veterinarian by ID — admin or vet
router.get('/:id', authenticateToken, authorizeRole(['admin']), VeterinarianController.getVeterinarianById);

// Update a veterinarian profile by ID — admin or vet
router.put('/:id', authenticateToken, authorizeRole(['admin']), VeterinarianController.updateVeterinarian);

// Delete a veterinarian profile by ID — only admin
router.delete('/:id', authenticateToken, authorizeRole(['admin']), VeterinarianController.deleteVeterinarian);

module.exports = router;