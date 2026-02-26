const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['conference', 'wedding', 'concert', 'sports', 'exhibition', 'corporate', 'social', 'outdoor'],
    required: true
  },
  capacity: { type: Number, required: true, min: 1 },
  pricePerHour: { type: Number, required: true, min: 0 },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: { lat: { type: Number }, lng: { type: Number } }
  },
  amenities: [{ type: String }],
  images: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  availability: [availabilitySlotSchema],
  isActive: { type: Boolean, default: true },
  tags: [String],
  rules: [String],
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'moderate'
  }
}, { timestamps: true });

venueSchema.index({ 'location.city': 1, category: 1, capacity: 1 });
venueSchema.index({ name: 'text', description: 'text', 'location.city': 'text' });

module.exports = mongoose.model('Venue', venueSchema);
