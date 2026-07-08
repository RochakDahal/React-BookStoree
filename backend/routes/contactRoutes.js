const express = require('express');
const router = express.Router();
const { submitContact, getContacts, updateContactStatus } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// Public route to submit a contact form
router.post('/', submitContact);

// Admin routes to view and manage contact submissions
router.get('/', protect, authorize('admin'), getContacts);
router.put('/:id', protect, authorize('admin'), updateContactStatus);

module.exports = router;