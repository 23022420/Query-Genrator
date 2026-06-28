const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { sanitizeInput, validateRegister, validateLogin } = require('../middleware/validate');

router.post('/register', sanitizeInput, validateRegister, register);
router.post('/login', sanitizeInput, validateLogin, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, sanitizeInput, updateProfile);
router.put('/change-password', protect, sanitizeInput, changePassword);

module.exports = router;
