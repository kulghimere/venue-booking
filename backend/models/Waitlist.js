const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  requestedDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  guestCount: { type: Number, required: true, min: 1 },
  position: { type: Number, required: true },
  status: { type: String, enum: ['active', 'notified', 'expired'], default: 'active' },
  notifiedAt: { type: Date },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 48 * 60 * 60 * 1000) }
}, { timestamps: true });

waitlistSchema.index({ venue: 1, requestedDate: 1, status: 1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);
