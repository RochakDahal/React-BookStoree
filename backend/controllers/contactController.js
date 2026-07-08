const Contact = require('../models/Contact');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Create contact submission
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message
    });

    // TODO: Send email notification to admin
    // TODO: Send WhatsApp message (if phone provided)

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all contact submissions (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
exports.getContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Contact.countDocuments(query);

    res.json({
      success: true,
      count: contacts.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      contacts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact submission not found' });
    }

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      contact
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};