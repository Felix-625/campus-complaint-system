const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', register);
router.post('/login', loginLimiter, login);

// Private route
router.get('/me', authenticateUser, getMe);

module.exports = router;
