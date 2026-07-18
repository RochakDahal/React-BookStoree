// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

// Helper function to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Register request body:', req.body);

    const { firstName, lastName, gender, address, city, phone, email, password, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: firstName, lastName, email, password'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Normalize gender
    const genderMap = {
      'male': 'male',
      'female': 'female',
      'other': 'other',
      'prefer not to say': 'prefer not to say',
      'Male': 'male',
      'Female': 'female',
      'Other': 'other',
      'Prefer Not to Say': 'prefer not to say'
    };
    const normalizedGender = genderMap[gender] || 'prefer not to say';

    // ✅ Create user with role support
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender: normalizedGender,
      address: address || '',
      city: city || '',
      phone: phone || '',
      email: email.toLowerCase().trim(),
      password: password,
      role: role || 'user'  // ✅ Accept role from request or default to 'user'
    });

    // Generate token
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
        role: user.role  // ✅ Returns the actual role
      }
    });
  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('📝 Login request body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
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
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
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
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Get Me Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ @desc    Register admin user
// @route   POST /api/auth/register-admin
// @access  Public (or Protected)
router.post('/register-admin', async (req, res) => {
  try {
    console.log('📝 Admin Register request:', req.body);

    const { firstName, lastName, gender, address, city, phone, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists. Only one admin is allowed.'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // ✅ Force role to be 'admin'
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender: gender || 'prefer not to say',
      address: address || '',
      city: city || '',
      phone: phone || '',
      email: email.toLowerCase().trim(),
      password: password,
      role: 'admin'  // ✅ Force admin role
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
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;