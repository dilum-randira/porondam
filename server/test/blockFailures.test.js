const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Block = require('../models/Block');
const User = require('../models/User');
const { blockUser, unblockUser, listBlocked } = require('../controllers/blockController');

function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('missing target returns 404 without creating a block', async (t) => {
  const oldExists = User.exists, oldUpdate = Block.updateOne;
  t.after(() => { User.exists = oldExists; Block.updateOne = oldUpdate; });
  User.exists = async () => false;
  Block.updateOne = async () => { throw Error('unexpected mutation'); };
  const res = response();
  await blockUser({ user: { _id: new mongoose.Types.ObjectId() }, params: { userId: String(new mongoose.Types.ObjectId()) } }, res);
  assert.equal(res.statusCode, 404);
});

test('block persistence failures return generic errors without leaking internals', async (t) => {
  const oldExists = User.exists, oldUpdate = Block.updateOne;
  t.after(() => { User.exists = oldExists; Block.updateOne = oldUpdate; });
  User.exists = async () => true;
  Block.updateOne = async () => { throw Error('sensitive database connection details'); };
  const res = response();
  await blockUser({ user: { _id: new mongoose.Types.ObjectId() }, params: { userId: String(new mongoose.Types.ObjectId()) } }, res);
  assert.equal(res.statusCode, 500);
  assert.doesNotMatch(JSON.stringify(res.body), /sensitive|database connection/i);
});

test('blocked list is owner-scoped and exposes only minimal account data', async (t) => {
  const oldFind = Block.find;
  t.after(() => { Block.find = oldFind; });
  const owner = new mongoose.Types.ObjectId(), target = new mongoose.Types.ObjectId();
  let filter;
  Block.find = (query) => {
    filter = query;
    return { sort: () => ({ limit: () => ({ populate: async () => [
      { blocked: { _id: target, name: 'Example', email: 'private@example.com' }, createdAt: new Date('2026-11-01') },
      { blocked: null },
    ] }) }) };
  };
  const res = response();
  await listBlocked({ user: { _id: owner } }, res);
  assert.deepEqual(filter, { blocker: owner });
  assert.equal(res.body.length, 1);
  assert.equal(res.body[0].name, 'Example');
  assert.equal(res.body[0].userId, target);
  assert.equal('email' in res.body[0], false);
});
