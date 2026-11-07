const express = require('express');
const { getFeed, getMatches, swipe } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdult } = require('../middleware/requireAdult');

const router = express.Router();

router.get('/', protect, getMatches);
router.get('/feed', protect, requireAdult, getFeed);
router.post('/swipe', protect, requireAdult, swipe);

module.exports = router;
