const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} = require('../utils/email');

// ── Helpers ───────────────────────────────────────────────────────────────────

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Gmail only
const gmailRegex = /^[^\s@]+@gmail\.com$/i;

// Letters only, at least 2 chars
const nameRegex = /^[A-Za-z]{2,}$/;

// UK phone: always +44 followed by 10 digits
const phoneRegex = /^\+44\d{10}$/;

const passwordStrength = (pw) => {
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(pw)) return 'Password must contain at least one number';
  return null;
};

const makeVerificationToken = () => {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
};

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, role, phone } = req.body;

    // First name
    if (!firstName || !nameRegex.test(firstName.trim()))
      return res.status(400).json({
        success: false,
        message: !firstName
          ? 'First name is required'
          : 'First name must be at least 2 characters and contain only letters',
      });

    // Last name
    if (!lastName || !nameRegex.test(lastName.trim()))
      return res.status(400).json({
        success: false,
        message: !lastName
          ? 'Last name is required'
          : 'Last name must be at least 2 characters and contain only letters',
      });

    // Email — Gmail only
    if (!email || !gmailRegex.test(email))
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Gmail address (e.g. yourname@gmail.com)',
      });

    // Phone — required, UK format
    if (!phone || !phone.trim())
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    if (!phoneRegex.test(phone.trim()))
      return res.status(400).json({
        success: false,
        message: 'Enter a valid UK phone number (e.g. +447700900123)',
      });

    // Password
    if (!password)
      return res.status(400).json({ success: false, message: 'Password is required' });

    const pwError = passwordStrength(password);
    if (pwError) return res.status(400).json({ success: false, message: pwError });

    if (confirmPassword !== undefined && password !== confirmPassword)
      return res.status(400).json({ success: false, message: 'Passwords do not match' });

    // Role
    const allowedRoles = ['user', 'venue_owner'];
    if (role && !allowedRoles.includes(role))
      return res.status(400).json({ success: false, message: 'Invalid role. Choose "user" or "venue_owner"' });

    // Duplicate check
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });

    const { raw, hashed } = makeVerificationToken();

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password,
      role: role || 'user',
      phone: phone.trim(),
      emailVerificationToken: hashed,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    // Respond immediately — don't block on email sending
    res.status(201).json({
      success: true,
      message: 'Account created. A verification link has been sent to your Gmail. Please verify your email before logging in.',
    });

    // Send email in background after response is flushed
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${raw}`;
    sendVerificationEmail(user, verificationURL).catch(err =>
      console.error('Verification email failed:', err.message)
    );
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── Verify Email ──────────────────────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or has expired. Please request a new one.',
      });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Resend Verification Email ─────────────────────────────────────────────────
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !gmailRegex.test(email))
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Gmail address',
      });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.isEmailVerified)
      return res.json({ success: true, message: 'If that email exists and is unverified, a new link has been sent.' });

    const { raw, hashed } = makeVerificationToken();
    user.emailVerificationToken = hashed;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'If that email exists and is unverified, a new link has been sent.',
    });

    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${raw}`;
    sendVerificationEmail(user, verificationURL).catch(err =>
      console.error('Resend verification email failed:', err.message)
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password, portal } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    if (!gmailRegex.test(email))
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Gmail address',
      });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact support.' });

    if (!user.isEmailVerified)
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
      });

    // Role-portal enforcement
    if (portal) {
      if (portal === 'admin' && user.role !== 'admin')
        return res.status(403).json({ success: false, message: 'Access denied. This portal is for admins only.' });

      if (portal === 'venue_owner' && user.role !== 'venue_owner')
        return res.status(403).json({
          success: false,
          message: user.role === 'admin'
            ? 'Admins cannot sign in through the Venue Owner portal.'
            : 'This portal is for venue owners only. Please use the regular sign-in page.',
        });

      if (portal === 'user' && user.role !== 'user')
        return res.status(403).json({
          success: false,
          message: user.role === 'admin'
            ? 'Admins must use the Admin portal to sign in.'
            : 'Venue owners must sign in through the Venue Owner portal.',
        });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── Get current user ──────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── Update profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, location, preferences } = req.body;
    let { phone } = req.body;

    if (firstName !== undefined && !nameRegex.test(firstName.trim()))
      return res.status(400).json({
        success: false,
        message: 'First name must be at least 2 characters and contain only letters',
      });

    if (lastName !== undefined && !nameRegex.test(lastName.trim()))
      return res.status(400).json({
        success: false,
        message: 'Last name must be at least 2 characters and contain only letters',
      });

    if (phone !== undefined && phone !== '') {
      if (!phoneRegex.test(phone.trim()))
        return res.status(400).json({
          success: false,
          message: 'Enter a valid UK phone number (e.g. +447700900123)',
        });
      phone = phone.trim();
    }

    const updates = {};
    if (firstName) updates.firstName = firstName.trim();
    if (lastName) updates.lastName = lastName.trim();
    if (phone !== undefined) updates.phone = phone;
    if (location) updates.location = location;
    if (preferences) updates.preferences = preferences;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !gmailRegex.test(email))
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid Gmail address',
      });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user)
      return res.json({ success: true, message: 'If an account exists for that email, a reset link has been sent.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    res.json({
      success: true,
      message: 'If an account exists for that email, a reset link has been sent.',
    });

    sendPasswordResetEmail(user, resetURL).catch(async (emailErr) => {
      console.error('Password reset email failed:', emailErr.message);
      // Roll back token so the user can request again
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword)
      return res.status(400).json({ success: false, message: 'Both password fields are required' });
    if (password !== confirmPassword)
      return res.status(400).json({ success: false, message: 'Passwords do not match' });

    const pwError = passwordStrength(password);
    if (pwError) return res.status(400).json({ success: false, message: pwError });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired. Please request a new one.',
      });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    try {
      await sendPasswordChangedEmail(user);
    } catch (emailErr) {
      console.error('Password changed confirmation email failed:', emailErr.message);
    }

    const jwtToken = signToken(user._id);
    res.json({ success: true, message: 'Password reset successfully', token: jwtToken, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Change Password (logged-in user) ─────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ success: false, message: 'All password fields are required' });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ success: false, message: 'New passwords do not match' });

    const pwError = passwordStrength(newPassword);
    if (pwError) return res.status(400).json({ success: false, message: pwError });

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    if (currentPassword === newPassword)
      return res.status(400).json({ success: false, message: 'New password must be different from the current password' });

    user.password = newPassword;
    await user.save();

    try {
      await sendPasswordChangedEmail(user);
    } catch (emailErr) {
      console.error('Password changed confirmation email failed:', emailErr.message);
    }

    const token = signToken(user._id);
    res.json({ success: true, message: 'Password changed successfully', token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
