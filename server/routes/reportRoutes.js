const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimit');
const { submitReport } = require('../controllers/reportController');

const router = express.Router();
const reportLimiter = createRateLimiter({
  max: 5,
  windowMs: 15 * 60 * 1000,
  keyGenerator: (req) => req.user._id.toString(),
});
router.use(protect);
router.post('/:userId', reportLimiter, submitReport);
module.exports = router;
