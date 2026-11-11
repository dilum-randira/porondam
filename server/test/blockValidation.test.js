const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Block = require('../models/Block');
const User = require('../models/User');
const { blockUser, unblockUser } = require('../controllers/blockController');

function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
}

test('blocking rejects invalid and self-target identifiers before database calls', async (t) => {
  const original = User.exists;
  t.after(() => { User.exists = original; });
  User.exists = async () => { throw new Error('should not query'); };
  const ownId = new mongoose.Types.ObjectId();
  for (const userId of ['invalid', String(ownId)]) {
    const res = response();
    await blockUser({ user: { _id: ownId }, params: { userId } }, res);
    assert.equal(res.statusCode, 400);
  }
});

test('unblocking rejects malformed identifiers before database calls', async (t) => {
  const original = Block.deleteOne;
  t.after(() => { Block.deleteOne = original; });
  Block.deleteOne = async () => { throw new Error('should not query'); };
  const res = response();
  await unblockUser({ user: { _id: new mongoose.Types.ObjectId() }, params: { userId: 'bad' } }, res);
  assert.equal(res.statusCode, 400);
});
