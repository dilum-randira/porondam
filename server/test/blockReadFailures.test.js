const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Block = require('../models/Block');
const { listBlocked, unblockUser } = require('../controllers/blockController');

function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('blocked list returns empty array for no outgoing blocks', async (t) => {
  const oldFind = Block.find;
  t.after(() => { Block.find = oldFind; });
  Block.find = () => ({ sort: () => ({ limit: () => ({ populate: async () => [] }) }) });
  const res = response();
  await listBlocked({ user: { _id: new mongoose.Types.ObjectId() } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, []);
});

test('blocked list hides database errors', async (t) => {
  const oldFind = Block.find;
  t.after(() => { Block.find = oldFind; });
  Block.find = () => { throw Error('private database connection information'); };
  const res = response();
  await listBlocked({ user: { _id: new mongoose.Types.ObjectId() } }, res);
  assert.equal(res.statusCode, 500);
  assert.doesNotMatch(JSON.stringify(res.body), /private database/i);
});

test('failed unblock hides persistence errors', async (t) => {
  const oldDelete = Block.deleteOne;
  t.after(() => { Block.deleteOne = oldDelete; });
  Block.deleteOne = async () => { throw Error('private database connection information'); };
  const res = response();
  await unblockUser({ user: { _id: new mongoose.Types.ObjectId() }, params: { userId: String(new mongoose.Types.ObjectId()) } }, res);
  assert.equal(res.statusCode, 500);
  assert.doesNotMatch(JSON.stringify(res.body), /private database/i);
});
