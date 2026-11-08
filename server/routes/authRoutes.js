const express = require('express');
const { registerUser, loginUser, confirmLegacyAdult } = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();
const registrationLimit = createRateLimiter({ max: 5 });
const signInLimit = createRateLimiter({ max: 10 });

router.post('/register', registrationLimit, registerUser);
router.post('/login', signInLimit, loginUser);
// Process-local throttling; production requires a shared rate-limit store.
router.post('/confirm-adult', protect, createRateLimiter({ max: 5 }), confirmLegacyAdult);

module.exports = router;
