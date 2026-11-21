const test = require('node:test');
const assert = require('node:assert/strict');
const { photoUploadResponse } = require('../utils/uploadResponse');

test('only exposes image URLs, never account secrets or legacy coordinates', () => {
  const response = photoUploadResponse({
    _id: 'account-id', email: 'private@example.com', password: 'hash',
    dateOfBirth: new Date('1990-01-01'), location: { coordinates: [80, 7] },
    images: ['https://res.cloudinary.com/example/image/upload/photo.jpg'],
  });
  assert.deepEqual(Object.keys(response), ['images']);
  assert.deepEqual(response.images, ['https://res.cloudinary.com/example/image/upload/photo.jpg']);
  assert.equal(JSON.stringify(response).includes('private@example.com'), false);
});

test('refuses to serialize missing image arrays', () => {
  assert.throws(() => photoUploadResponse(null), TypeError);
  assert.throws(() => photoUploadResponse({ images: 'invalid' }), TypeError);
});
