// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  registerAdmin
} = require('../controllers/authController');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/register-admin
 * @desc    Register admin user (only if no admin exists)
 * @access  Public
 */
router.post('/register-admin', registerAdmin);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset link to user's email
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', resetPassword);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user profile
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile (name, phone, address, etc.)
 * @access  Private
 */
router.put('/update-profile', protect, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password (requires current password)
 * @access  Private
 */
router.put('/change-password', protect, changePassword);

module.exports = router;