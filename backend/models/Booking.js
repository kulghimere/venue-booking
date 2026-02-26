const mongoose = require('mongoose');

const editRequestSchema = new mongoose.Schema({
  status:         { type: String, enum: ['pending', 'approved', 'rejected'] },
  date:           Date,
  startTime:      String,
  endTime:        String,
  guestCount:     Number,
  specialRequests:String,
  totalHours:     Number,
  totalPrice:     Number,
  requestedAt:    Date,
  reviewedAt:     Date,
  ownerNote:      String
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: { type: String, required: true },
  eventTitle: { type: String, required: true },
  guestCount: { type: Number, required: true, min: 1 },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  totalHours: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'waitlisted', 'rejected'],
    default: 'pending'
  },
  waitlistPosition: { type: Number },
  specialRequests: { type: String },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  cancellationReason: String,
  rejectionReason: String,
  confirmedAt: Date,
  cancelledAt: Date,
  rejectedAt: Date,
  mlScore: { type: Number },
  notes: String,
  editRequest: editRequestSchema
}, { timestamps: true });

bookingSchema.index({ venue: 1, date: 1, status: 1 });
bookingSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
