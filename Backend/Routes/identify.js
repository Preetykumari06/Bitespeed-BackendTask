const express = require('express');
const identifyRouter = express.Router();
const { Op } = require('sequelize');
const Contact = require('../Models/contact');

identifyRouter.post('/identify', async (req, res) => {
  const { email, phoneNumber } = req.body;

  try {
    // Find existing contacts
    const contacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { email: email || null },
          { phoneNumber: phoneNumber || null }
        ]
      }
    });

    if (contacts.length === 0) {
      // Create new primary contact if no existing contacts found
      const newContact = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: 'primary'
      });
      return res.status(200).json({
        contact: {
          primaryContactId: newContact.id,
          emails: [newContact.email].filter(Boolean),
          phoneNumbers: [newContact.phoneNumber].filter(Boolean),
          secondaryContactIds: []
        }
      });
    }

  } catch (error) {
    res.status(500).json({ error: 'Error identifying contact', details: error.message });
  }
});

module.exports = identifyRouter;
