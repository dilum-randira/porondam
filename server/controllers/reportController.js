const mongoose = require('mongoose');
const User = require('../models/User');
const Report = require('../models/Report');
const { validateReport } = require('../utils/reportValidation');

async function submitReport(req, res) {
  const reported = req.params.userId;
  if (!mongoose.isValidObjectId(reported) || String(reported) === String(req.user._id)) {
    return res.status(400).json({ message: 'Invalid account.' });
  }
  const input = validateReport(req.body);
  if (!input) return res.status(400).json({ message: 'Invalid report details.' });
  try {
    const exists = await User.exists({ _id: reported });
    if (!exists) return res.status(404).json({ message: 'Account not found.' });
    await Report.create({ reporter: req.user._id, reported, ...input });
    return res.status(201).json({ submitted: true });
  } catch {
    return res.status(500).json({ message: 'Unable to submit report.' });
  }
}

module.exports = { submitReport };
