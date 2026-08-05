// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// ============================================
// GENDER NORMALIZATION HELPER (safety net)
// ============================================
const normalizeGender = (gender) => {
  const genderMap = {
    'male': 'male', 'female': 'female', 'other': 'other',
    'prefer not to say': 'prefer not to say',
    'Male': 'male', 'Female': 'female', 'Other': 'other',
    'Prefer Not to Say': 'prefer not to say',
    'M': 'male', 'F': 'female',
    '': 'prefer not to say', null: 'prefer not to say', undefined: 'prefer not to say'
  };
  return genderMap[gender] || 'prefer not to say';
};

// ============================================
// REGISTER
// ============================================
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, gender, address, city, phone, email, password } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender: normalizeGender(gender),
      address: address || '',
      city: city || '',
      phone: phone || '',
      email: email.toLowerCase().trim(),
      password: password,
      role: 'user'
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        address: user.address,
        city: user.city,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// LOGIN
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        address: user.address,
        city: user.city,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET PROFILE
// ============================================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        address: user.address,
        city: user.city,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Get Me Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// UPDATE PROFILE
// ============================================
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, gender, address, city, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.gender = normalizeGender(gender); // ✅ normalized
    user.address = address || user.address;
    user.city = city || user.city;
    user.phone = phone || user.phone;

    await user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        address: user.address,
        city: user.city,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CHANGE PASSWORD (logged in user)
// ============================================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // ✅ Normalize gender in case it's still capitalized (safety)
    user.gender = normalizeGender(user.gender);
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// FORGOT PASSWORD – send reset link
// ============================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user with that email' });
    }

    // ✅ Normalize gender (safety)
    user.gender = normalizeGender(user.gender);

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '2m' }
    );

    // Store token in user (for invalidation)
    user.resetPasswordToken = resetToken;
    user.resetPasswordUsed = false;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const html = `
      <h1>🔐 Password Reset</h1>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#14b8a6;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>This link expires in 2 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    // ✅ Try to send email, but don't crash if it fails (log error)
    try {
      await sendEmail({
        to: user.email,
        subject: ' Password Reset - BookShell',
        html
      });
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      // Still return success, but log the error (you may want to handle differently)
    }

    res.json({ success: true, message: 'Reset link sent to your email' });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// RESET PASSWORD (Single-use token)
// ============================================
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check token usage
    if (!user.resetPasswordToken || user.resetPasswordToken !== token) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }
    if (user.resetPasswordUsed) {
      return res.status(400).json({ success: false, message: 'This reset link has already been used' });
    }

    // ✅ Normalize gender (safety)
    user.gender = normalizeGender(user.gender);

    // Update password and invalidate token
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordUsed = true;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// REGISTER ADMIN
// ============================================
exports.registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, gender, address, city, phone, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin already exists. Only one admin is allowed.' });
    }
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender: normalizeGender(gender),
      address: address || '',
      city: city || '',
      phone: phone || '',
      email: email.toLowerCase().trim(),
      password: password,
      role: 'admin'
    });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        address: user.address,
        city: user.city,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Admin Registration Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};