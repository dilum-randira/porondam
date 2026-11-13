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

function parsePage(value) {
  if (value === undefined) return 1;
  if (typeof value !== 'string' || !/^[1-9]\d{0,3}$/.test(value)) return null;
  const page = Number(value);
  return page <= 1000 ? page : null;
}

async function listBlocked(req, res) {
  const page = parsePage(req.query.page);
  if (page === null) return res.status(400).json({ message: 'Invalid page.' });
  const limit = 25;
  try {
    const records = await Block.find({ blocker: req.user._id })
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit + 1)
      .populate('blocked', 'name');
    const hasMore = records.length > limit;
    const accounts = records.slice(0, limit).filter((record) => record.blocked).map((record) => ({
      userId: record.blocked._id, name: record.blocked.name,
      blockedAt: record.createdAt,
    }));
    return res.json({ accounts, page, hasMore });
  } catch {
    return res.status(500).json({ message: 'Unable to load blocked accounts.' });
  }
}

module.exports = { blockUser, unblockUser, listBlocked };
