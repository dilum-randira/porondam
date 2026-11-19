const test = require('node:test');
const assert = require('node:assert/strict');
const { createRateLimiter } = require('../middleware/rateLimit');

function attempt(limiter, id, ip = '192.0.2.1') {
  const req = { ip, user: id ? { _id: { toString: () => id } } : undefined };
  const res = {
    statusCode: 200, headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(n) { this.statusCode = n; return this; },
    json(body) { this.body = body; return this; },
  };
  let allowed = false;
  limiter(req, res, () => { allowed = true; });
  return { allowed, res };
}

test('identity limiter prevents repeated uploads by the same user across IPs', () => {
  const limiter = createRateLimiter({ max: 2, keyGenerator: req => req.user?._id?.toString() });
  assert.equal(attempt(limiter, 'account-A', '192.0.2.1').allowed, true);
  assert.equal(attempt(limiter, 'account-A', '192.0.2.2').allowed, true);
  const denied = attempt(limiter, 'account-A', '192.0.2.3');
  assert.equal(denied.allowed, false);
  assert.equal(denied.res.statusCode, 429);
  assert.ok(Number(denied.res.headers['Retry-After']) > 0);
});

test('different authenticated users have independent upload budgets', () => {
  const limiter = createRateLimiter({ max: 1, keyGenerator: req => req.user?._id?.toString() });
  assert.equal(attempt(limiter, 'account-A').allowed, true);
  assert.equal(attempt(limiter, 'account-A').allowed, false);
  assert.equal(attempt(limiter, 'account-B').allowed, true);
});

test('identity limiter rejects non-function key generator', () => {
  assert.throws(() => createRateLimiter({ keyGenerator: 'user' }), /Invalid rate-limit/);
});
