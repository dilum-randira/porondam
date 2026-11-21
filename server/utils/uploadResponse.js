// Keep private account fields out of upload responses and client-side storage.
function photoUploadResponse(account) {
  if (!account || !Array.isArray(account.images)) {
    throw new TypeError('Updated account must contain an images array');
  }
  return { images: account.images };
}

module.exports = { photoUploadResponse };
