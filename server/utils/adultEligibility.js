// Self-declared date of birth is an eligibility signal, not identity verification.
function isAdultBirthDate(value, today = new Date()) {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) return false;
  const cutoff = new Date(Date.UTC(today.getUTCFullYear() - 18, today.getUTCMonth(), today.getUTCDate()));
  return value <= cutoff;
}
module.exports = { isAdultBirthDate };
