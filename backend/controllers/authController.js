const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendTokenResponse, generateAccessToken } = require('../utils/tokenUtils');
const { sendEmail, getOTPEmailHTML, getResetEmailHTML } = require('../utils/emailTemplates');

// @desc   Register user
// @route  POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // Always log OTP to console for dev use
    console.log(`\n🔐 OTP for ${email}: ${otp}\n`);

    // Check if email is configured
    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com';

    if (!emailConfigured) {
      // Auto-verify in dev mode when email not configured
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      return sendTokenResponse(user, 201, res);
    }

    try {
      await sendEmail({
        to: email,
        subject: '🔐 Verify Your Adulting OS Account',
        html: getOTPEmailHTML(name, otp),
      });
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
    }

    res.status(201).json({ success: true, message: 'Registration successful! Check your email for the OTP.', email });
  } catch (err) { next(err); }
};

// @desc   Verify OTP
// @route  POST /api/v1/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ success: false, message: 'OTP has expired. Request a new one.' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

// @desc   Resend OTP
// @route  POST /api/v1/auth/resend-otp
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });
    await sendEmail({ to: email, subject: '🔐 Your New OTP - Adulting OS', html: getOTPEmailHTML(user.name, otp) });

    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (err) { next(err); }
};

// @desc   Login
// @route  POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email before logging in.', needsVerification: true, email });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

// @desc   Refresh access token
// @route  POST /api/v1/auth/refresh
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const accessToken = generateAccessToken(user._id);
    res.json({ success: true, accessToken });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// @desc   Logout
// @route  POST /api/v1/auth/logout
exports.logout = async (req, res) => {
  res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc   Forgot password
// @route  POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No user found with that email' });

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({ to: email, subject: '🔐 Reset Your Adulting OS Password', html: getResetEmailHTML(user.name, resetUrl) });

    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (err) { next(err); }
};

// @desc   Reset password
// @route  PUT /api/v1/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpiry');

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

// @desc   Get current user
// @route  GET /api/v1/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc   Update profile
// @route  PUT /api/v1/auth/update-profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// @desc   Change password
// @route  PUT /api/v1/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
};
