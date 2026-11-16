const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  blocker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blocked: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });
blockSchema.index({ blocked: 1, blocker: 1 });
// Supports stable newest-first pagination for one account.
blockSchema.index({ blocker: 1, createdAt: -1, _id: -1 });

module.exports = mongoose.model('Block', blockSchema);
