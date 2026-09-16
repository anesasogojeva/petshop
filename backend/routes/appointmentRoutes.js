const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Create appointment — only admin
router.post('/', authenticateToken,authorizeRole(['admin',  'veterinarian','user']), appointmentController.createAppointment);

// Get appointments for the logged-in user (any authenticated user)
router.get('/my-appointments', authenticateToken,authorizeRole(['admin','user','veterinarian']), appointmentController.getUserAppointments);

// Get all appointments — only admin
router.get('/', authenticateToken, authorizeRole('admin'), appointmentController.getAllAppointments);

// Get appointment by ID — only admin
router.get('/:id', authenticateToken, authorizeRole('admin'), appointmentController.getAppointmentById);

// Update appointment — only admin
router.put('/:id', authenticateToken, authorizeRole('admin'), appointmentController.updateAppointment);

// Update appointment status only — admin, the assigned veterinarian, or the
// owning patient (who is restricted server-side to only cancelling their own)
router.patch('/:id/status', authenticateToken, authorizeRole(['admin', 'veterinarian', 'user']), appointmentController.updateAppointmentStatus);

// Delete appointment — admin or appointment owner
router.delete('/:id', authenticateToken, appointmentController.deleteAppointment);

module.exports = router;
