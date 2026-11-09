const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { blockUser, unblockUser, listBlocked } = require('../controllers/blockController');

const router = express.Router();
router.use(protect);
router.get('/', listBlocked);
router.put('/:userId', blockUser);
router.delete('/:userId', unblockUser);
module.exports = router;
