const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();
const registrationLimit = createRateLimiter({ max: 5 });
const signInLimit = createRateLimiter({ max: 10 });

router.post('/register', registrationLimit, registerUser);
router.post('/login', signInLimit, loginUser);

module.exports = router;
