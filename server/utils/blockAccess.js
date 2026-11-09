const Block = require('../models/Block');

// A block in either direction prevents further discovery and communication.
async function isBlockedEitherWay(first, second) {
  return Boolean(await Block.exists({
    $or: [
      { blocker: first, blocked: second },
      { blocker: second, blocked: first },
    ],
  }));
}

async function excludedUserIds(userId) {
  const blocks = await Block.find({
    $or: [{ blocker: userId }, { blocked: userId }],
  }).select('blocker blocked').lean();
  return blocks.map((block) =>
    String(block.blocker) === String(userId) ? block.blocked : block.blocker
  );
}

module.exports = { isBlockedEitherWay, excludedUserIds };
