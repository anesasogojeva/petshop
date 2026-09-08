const express = require('express');
const { login, refresh, changePassword, confirmPasswordChange, logout,forgotPassword,resetPassword} = require('../controllers/authController'); // ✅ Must include changePassword
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/change-password', authenticateToken, changePassword); // ✅ This is safe now
router.post('/confirm-password-change', authenticateToken,confirmPasswordChange);
// Add this route to your authController or wherever routes are defined
router.get('/confirm-password-change', confirmPasswordChange);

router.post('/logout', logout);
// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);


module.exports = router;
