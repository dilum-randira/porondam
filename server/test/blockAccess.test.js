const test = require('node:test');
const assert = require('node:assert/strict');
const Block = require('../models/Block');
const { isBlockedEitherWay, excludedUserIds } = require('../utils/blockAccess');

test('block lookup checks both directions and denies either side', async (t) => {
  const original = Block.exists;
  t.after(() => { Block.exists = original; });
  let query;
  Block.exists = async (value) => { query = value; return { _id: 'block' }; };
  assert.equal(await isBlockedEitherWay('alice', 'bob'), true);
  assert.deepEqual(query.$or, [
    { blocker: 'alice', blocked: 'bob' },
    { blocker: 'bob', blocked: 'alice' },
  ]);
  Block.exists = async () => null;
  assert.equal(await isBlockedEitherWay('alice', 'bob'), false);
});

test('excluded accounts include incoming and outgoing blocks', async (t) => {
  const original = Block.find;
  t.after(() => { Block.find = original; });
  let filter;
  Block.find = (value) => {
    filter = value;
    return {
      select(fields) {
        assert.equal(fields, 'blocker blocked');
        return { lean: async () => [
          { blocker: 'me', blocked: 'other' },
          { blocker: 'third', blocked: 'me' },
        ] };
      },
    };
  };
  assert.deepEqual(await excludedUserIds('me'), ['other', 'third']);
  assert.deepEqual(filter.$or, [{ blocker: 'me' }, { blocked: 'me' }]);
});
