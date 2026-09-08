const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Create record — only admin
router.post('/', authenticateToken,authorizeRole(['admin',  'veterinarian']),recordController.createRecord);

// Get records for the logged-in user (pet owner or vet)
router.get('/my-records',authenticateToken,authorizeRole(['admin',  'veterinarian','user']), authenticateToken, recordController.getUserRecords);

// Get all records — only admin
router.get('/', authenticateToken, authorizeRole('admin'), recordController.getAllRecords);

// Get record by ID — only admin
router.get('/:id', authenticateToken, authorizeRole('admin'), recordController.getRecordById);

// Update record — only admin
router.put('/:id', authenticateToken, authorizeRole('admin'), recordController.updateRecord);

// Delete record — admin or record owner
router.delete('/:id', authenticateToken,authorizeRole(['admin',  'veterinarian','user']), recordController.deleteRecord);

module.exports = router;