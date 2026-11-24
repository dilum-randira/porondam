const REASONS = Object.freeze(['harassment', 'scam', 'impersonation', 'inappropriate_content', 'other']);

function validateReport(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (!REASONS.includes(body.reason)) return null;
  if (body.details !== undefined && typeof body.details !== 'string') return null;
  const details = (body.details || '').trim();
  if (details.length > 1000 || /[\u0000-\u001f\u007f]/.test(details)) return null;
  if (body.reason === 'other' && !details) return null;
  return { reason: body.reason, details };
}

module.exports = { validateReport, REASONS };
