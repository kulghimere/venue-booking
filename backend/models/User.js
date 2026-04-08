const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String, required: true, trim: true,
    match: [/^[A-Za-z]+$/, 'First name must contain only letters']
  },
  lastName: {
    type: String, required: true, trim: true,
    match: [/^[A-Za-z]+$/, 'Last name must contain only letters']
  },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'venue_owner', 'admin'], default: 'user' },
  phone: {
    type: String, required: true, trim: true,
    match: [/^\+44\d{10}$/, 'Please enter a valid UK phone number']
  },
  avatar: { type: String },
  location: {
    city: String,
    country: String,
    coordinates: { lat: Number, lng: Number }
  },
  preferences: {
    eventTypes: [String],
    budgetRange: { min: Number, max: Number },
    preferredCapacity: Number
  },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  lastLogin: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}, { timestamps: true });

// Virtual for full name
userSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
