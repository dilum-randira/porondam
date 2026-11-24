const test = require('node:test');
const assert = require('node:assert/strict');
const { validateReport } = require('../utils/reportValidation');

test('accepts a supported reason with bounded details', () => {
  assert.deepEqual(validateReport({ reason: 'scam', details: '  Requested money  ' }), {
    reason: 'scam', details: 'Requested money',
  });
});
test('rejects unknown reason and malformed bodies', () => {
  assert.equal(validateReport({ reason: 'fake' }), null);
  assert.equal(validateReport(null), null);
  assert.equal(validateReport([]), null);
});
test('requires explanation for other reports', () => {
  assert.equal(validateReport({ reason: 'other', details: '   ' }), null);
});
test('rejects excessive, non-string and control-character descriptions', () => {
  assert.equal(validateReport({ reason: 'scam', details: 'x'.repeat(1001) }), null);
  assert.equal(validateReport({ reason: 'scam', details: 123 }), null);
  assert.equal(validateReport({ reason: 'scam', details: 'bad\nline' }), null);
});
