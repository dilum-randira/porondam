const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  reported: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  reason: { type: String, enum: ['harassment', 'scam', 'impersonation', 'inappropriate_content', 'other'], required: true },
  details: { type: String, maxlength: 1000, default: '' },
  status: { type: String, enum: ['pending', 'reviewing', 'resolved', 'dismissed'], default: 'pending' },
}, { timestamps: true });

reportSchema.index({ status: 1, createdAt: 1 });
reportSchema.index({ reporter: 1, createdAt: -1 });
module.exports = mongoose.model('Report', reportSchema);
