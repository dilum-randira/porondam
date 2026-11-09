const mongoose = require('mongoose');
const Block = require('../models/Block');
const User = require('../models/User');

async function blockUser(req, res) {
  const target = req.params.userId;
  if (!mongoose.isValidObjectId(target) || String(target) === String(req.user._id)) {
    return res.status(400).json({ message: 'Invalid account.' });
  }
  try {
    if (!await User.exists({ _id: target })) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    await Block.updateOne(
      { blocker: req.user._id, blocked: target },
      { $setOnInsert: { blocker: req.user._id, blocked: target } },
      { upsert: true }
    );
    return res.status(200).json({ blocked: true });
  } catch {
    return res.status(500).json({ message: 'Unable to block account.' });
  }
}

async function unblockUser(req, res) {
  if (!mongoose.isValidObjectId(req.params.userId)) {
    return res.status(400).json({ message: 'Invalid account.' });
  }
  try {
    await Block.deleteOne({ blocker: req.user._id, blocked: req.params.userId });
    return res.json({ blocked: false });
  } catch {
    return res.status(500).json({ message: 'Unable to unblock account.' });
  }
}

async function listBlocked(req, res) {
  try {
    const records = await Block.find({ blocker: req.user._id })
      .sort({ createdAt: -1 }).limit(100)
      .populate('blocked', 'name');
    return res.json(records.filter((record) => record.blocked).map((record) => ({
      userId: record.blocked._id, name: record.blocked.name,
      blockedAt: record.createdAt,
    })));
  } catch {
    return res.status(500).json({ message: 'Unable to load blocked accounts.' });
  }
}

module.exports = { blockUser, unblockUser, listBlocked };
