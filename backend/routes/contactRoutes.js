// backend/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middleware/auth');

// ✅ @desc    Submit contact form (Public)
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, comment } = req.body;
    
    console.log('📝 Contact form submission:', { name, email, phone, comment });

    if (!name || !email || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and message'
      });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      comment: comment.trim()
    });

    console.log('✅ Contact saved:', contact._id);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: contact
    });
  } catch (error) {
    console.error('❌ Contact Form Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ @desc    Get all contacts (Admin only)
// @route   GET /api/contacts
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: contacts.length,
      contacts
    });
  } catch (error) {
    console.error('❌ Get Contacts Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ @desc    Update contact status (Admin only)
// @route   PUT /api/contacts/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    console.log('📝 Updating contact status:', { id: req.params.id, status });

    if (!['pending', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, read, or replied'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    console.log('✅ Contact status updated:', contact._id);

    res.json({
      success: true,
      message: 'Status updated successfully',
      contact
    });
  } catch (error) {
    console.error('❌ Update Contact Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ @desc    Delete contact (Admin only)
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    console.log('🗑️ Deleting contact:', req.params.id);

    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    console.log('✅ Contact deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete Contact Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;