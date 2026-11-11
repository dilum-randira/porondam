const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Block = require('../models/Block');
const User = require('../models/User');
const { blockUser, unblockUser } = require('../controllers/blockController');

const makeRes = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(value) { this.body = value; return this; },
});

test('blocking scopes mutation to authenticated account and uses idempotent upsert', async (t) => {
  const oldExists = User.exists, oldUpdate = Block.updateOne;
  t.after(() => { User.exists = oldExists; Block.updateOne = oldUpdate; });
  const owner = new mongoose.Types.ObjectId(), target = new mongoose.Types.ObjectId();
  User.exists = async () => true;
  let captured;
  Block.updateOne = async (...args) => { captured = args; };
  const res = makeRes();
  await blockUser({ user: { _id: owner }, params: { userId: String(target) } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { blocked: true });
  assert.equal(String(captured[0].blocker), String(owner));
  assert.equal(captured[0].blocked, String(target));
  assert.equal(captured[2].upsert, true);
  assert.deepEqual(captured[1].$setOnInsert, captured[0]);
});

test('unblocking deletes only the authenticated account outgoing block', async (t) => {
  const oldDelete = Block.deleteOne;
  t.after(() => { Block.deleteOne = oldDelete; });
  const owner = new mongoose.Types.ObjectId(), target = new mongoose.Types.ObjectId();
  let filter;
  Block.deleteOne = async (value) => { filter = value; };
  const res = makeRes();
  await unblockUser({ user: { _id: owner }, params: { userId: String(target) } }, res);
  assert.deepEqual(filter, { blocker: owner, blocked: String(target) });
  assert.deepEqual(res.body, { blocked: false });
});
