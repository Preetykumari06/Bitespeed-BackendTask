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

 // Identify primary contact and related contacts
 let primaryContact = contacts.find(contact => contact.linkPrecedence === 'primary') || contacts[0];
 const secondaryContacts = contacts.filter(contact => contact.linkPrecedence === 'secondary');

 // Update primary contact if necessary
 if (email && primaryContact.email !== email) {
   primaryContact.email = email;
   await primaryContact.save();
 }

 if (phoneNumber && primaryContact.phoneNumber !== phoneNumber) {
   primaryContact.phoneNumber = phoneNumber;
   await primaryContact.save();
 }

// Create secondary contact if email or phoneNumber doesn't match with primary contact
if (email || phoneNumber) {
    const newSecondaryContact = await Contact.create({
      email: email || primaryContact.email,
      phoneNumber: phoneNumber || primaryContact.phoneNumber,
      linkPrecedence: 'secondary',
      linkedId: primaryContact.id
    });
    secondaryContacts.push(newSecondaryContact);
  }

  // Response with primary and secondary contacts
  const response = {
    primaryContact: {
      id: primaryContact.id,
      phoneNumber: primaryContact.phoneNumber,
      email: primaryContact.email,
      linkedId: primaryContact.linkedId,
      linkPrecedence: primaryContact.linkPrecedence,
      createdAt: primaryContact.createdAt,
      updatedAt: primaryContact.updatedAt,
      deletedAt: primaryContact.deletedAt
    },
    secondaryContacts: secondaryContacts.map(contact => ({
      id: contact.id,
      phoneNumber: contact.phoneNumber,
      email: contact.email,
      linkedId: contact.linkedId,
      linkPrecedence: contact.linkPrecedence,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      deletedAt: contact.deletedAt
    }))
  };

    return res.status(200).json({
        contact: {
          primaryContactId: primaryContact.id,
          emails: contacts.map(contact => contact.email),
          phoneNumbers: contacts.map(contact => contact.phoneNumber),
          secondaryContactIds: secondaryContacts.map(contact => contact.id)
        }
      });
      
  
    } catch (error) {
       res.status(500).json({ error: 'Error identifying contact', details: error.message });
    }
});

module.exports = identifyRouter;
