const User = require('../models/User');
const { isAdultBirthDate } = require('../utils/adultEligibility');

async function requireAdult(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('+dateOfBirth');
    if (!user) return res.status(401).json({ message: 'Account not found.' });
    if (!isAdultBirthDate(user.dateOfBirth)) {
      return res.status(403).json({ code: 'AGE_CONFIRMATION_REQUIRED', message: 'Discovery is available only to accounts with an adult date of birth. Contact support if your account predates this requirement.' });
    }
    return next();
  } catch {
    return res.status(500).json({ message: 'Unable to check account eligibility.' });
  }
}
module.exports = { requireAdult };
