const test = require('node:test');
const assert = require('node:assert/strict');
const { createRateLimiter } = require('../middleware/rateLimit');

function request(limiter, ip = '192.0.2.1') {
  const response = {
    code: 200, headers: {}, body: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let allowed = false;
  limiter({ ip }, response, () => { allowed = true; });
  return { allowed, response };
}

test('allows up to the configured limit and rejects additional attempts', () => {
  const limiter = createRateLimiter({ max: 2, windowMs: 1000, now: () => 100 });
  assert.equal(request(limiter).allowed, true);
  assert.equal(request(limiter).allowed, true);
  const blocked = request(limiter);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.response.code, 429);
  assert.equal(blocked.response.headers['Retry-After'], '1');
});

test('enforces limits independently for each client IP', () => {
  const limiter = createRateLimiter({ max: 1 });
  assert.equal(request(limiter, '192.0.2.1').allowed, true);
  assert.equal(request(limiter, '192.0.2.1').allowed, false);
  assert.equal(request(limiter, '192.0.2.2').allowed, true);
});

test('resets the window when it expires', () => {
  let time = 100;
  const limiter = createRateLimiter({ max: 1, windowMs: 500, now: () => time });
  assert.equal(request(limiter).allowed, true);
  time = 400;
  assert.equal(request(limiter).allowed, false);
  time = 600;
  assert.equal(request(limiter).allowed, true);
});

test('fails closed when too many different active keys exist', () => {
  const limiter = createRateLimiter({ max: 1, maxKeys: 1, windowMs: 1000, now: () => 100 });
  assert.equal(request(limiter, '192.0.2.1').allowed, true);
  const other = request(limiter, '192.0.2.2');
  assert.equal(other.allowed, false);
  assert.equal(other.response.code, 429);
});

test('rejects invalid configuration', () => {
  assert.throws(() => createRateLimiter({ max: 0 }), /Invalid rate-limit/);
  assert.throws(() => createRateLimiter({ windowMs: -1 }), /Invalid rate-limit/);
});
