const test = require('node:test');
const assert = require('node:assert/strict');
const { detectImageType, validateImage, MAX_IMAGE_BYTES } = require('../utils/imageValidation');

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0]);
test('recognizes JPEG and PNG magic bytes', () => {
  assert.equal(detectImageType(jpeg), 'image/jpeg');
  assert.equal(detectImageType(png), 'image/png');
});
test('accepts matching image declarations', () => {
  assert.equal(validateImage({ buffer: jpeg, mimetype: 'image/jpeg', originalname: 'portrait.JPG' }), true);
  assert.equal(validateImage({ buffer: png, mimetype: 'image/png', originalname: 'portrait.png' }), true);
});
test('rejects disguised files, mismatched MIME and extension', () => {
  assert.equal(validateImage({ buffer: Buffer.from('<script>'), mimetype: 'image/png', originalname: 'x.png' }), false);
  assert.equal(validateImage({ buffer: png, mimetype: 'image/jpeg', originalname: 'x.jpg' }), false);
  assert.equal(validateImage({ buffer: jpeg, mimetype: 'image/jpeg', originalname: 'x.png' }), false);
});
test('rejects empty and oversized payloads', () => {
  assert.equal(validateImage({ buffer: Buffer.alloc(0), mimetype: 'image/png', originalname: 'x.png' }), false);
  assert.equal(validateImage({ buffer: Buffer.alloc(MAX_IMAGE_BYTES + 1), mimetype: 'image/png', originalname: 'x.png' }), false);
});
