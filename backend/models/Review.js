const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 }
}, { timestamps: true });

reviewSchema.index({ venue: 1, user: 1 });

async function updateVenueRating(venueId) {
  const Venue = mongoose.model('Venue');
  const result = await mongoose.model('Review').aggregate([
    { $match: { venue: venueId } },
    { $group: { _id: '$venue', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (result.length > 0) {
    await Venue.findByIdAndUpdate(venueId, { rating: Math.round(result[0].avg * 10) / 10, reviewCount: result[0].count });
  } else {
    await Venue.findByIdAndUpdate(venueId, { rating: 0, reviewCount: 0 });
  }
}

reviewSchema.post('save', async function () {
  await updateVenueRating(this.venue);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updateVenueRating(doc.venue);
});

reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await updateVenueRating(this.venue);
});

module.exports = mongoose.model('Review', reviewSchema);
