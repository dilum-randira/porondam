const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Block = require('../models/Block');
const { listBlocked } = require('../controllers/blockController');

function response() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

test('rejects malformed and out-of-range page numbers without querying storage', async (t) => {
  const oldFind = Block.find;
  t.after(() => { Block.find = oldFind; });
  Block.find = () => { throw new Error('should not query'); };
  for (const page of ['0', '-1', '1.5', '1001', '01', 'abc', '', ['1']]) {
    const res = response();
    await listBlocked({ user: { _id: new mongoose.Types.ObjectId() }, query: { page } }, res);
    assert.equal(res.statusCode, 400, String(page));
  }
});

test('paginates by authenticated owner with deterministic ordering and bounded lookahead', async (t) => {
  const oldFind = Block.find;
  t.after(() => { Block.find = oldFind; });
  const owner = new mongoose.Types.ObjectId();
  let filter, ordering, offset, limit;
  const rows = Array.from({ length: 26 }, (_, i) => ({
    blocked: { _id: new mongoose.Types.ObjectId(), name: 'Person ' + i, email: 'private@example.com' },
    createdAt: new Date('2026-11-01'),
  }));
  Block.find = (q) => {
    filter = q;
    return { sort(s) { ordering = s; return this; }, skip(n) { offset = n; return this; },
      limit(n) { limit = n; return this; }, async populate() { return rows; } };
  };
  const res = response();
  await listBlocked({ user: { _id: owner }, query: { page: '2' } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(filter, { blocker: owner });
  assert.deepEqual(ordering, { createdAt: -1, _id: -1 });
  assert.equal(offset, 25);
  assert.equal(limit, 26);
  assert.equal(res.body.page, 2);
  assert.equal(res.body.hasMore, true);
  assert.equal(res.body.accounts.length, 25);
  assert.equal('email' in res.body.accounts[0], false);
});


test('defaults to the first page when no query object is supplied', async (t) => {
  const oldFind = Block.find;
  t.after(() => { Block.find = oldFind; });
  let offset, pageLimit;
  Block.find = () => ({ sort() { return this; }, skip(n) { offset = n; return this; },
    limit(n) { pageLimit = n; return this; }, async populate() { return []; } });
  const res = response();
  await listBlocked({ user: { _id: new mongoose.Types.ObjectId() } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { accounts: [], page: 1, hasMore: false });
  assert.equal(offset, 0);
  assert.equal(pageLimit, 26);
});
