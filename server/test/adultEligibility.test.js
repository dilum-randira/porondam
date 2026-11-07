const test = require('node:test');
const assert = require('node:assert/strict');
const { isAdultBirthDate } = require('../utils/adultEligibility');
const today = new Date('2026-11-08T00:00:00Z');
test('exactly eighteen is eligible', () => assert.equal(isAdultBirthDate(new Date('2008-11-08'), today), true));
test('one day under eighteen is ineligible', () => assert.equal(isAdultBirthDate(new Date('2008-11-09'), today), false));
test('missing and invalid dates are ineligible', () => {
  assert.equal(isAdultBirthDate(null, today), false);
  assert.equal(isAdultBirthDate(new Date('invalid'), today), false);
});
test('old birth dates are eligible', () => assert.equal(isAdultBirthDate(new Date('1990-01-01'), today), true));
