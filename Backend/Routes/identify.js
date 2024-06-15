const express = require('express');
const identifyRouter = express.Router();
const { Op } = require('sequelize');
const Contact = require('../Models/contact');

identifyRouter.post('/identify', async (req, res) => {
  const { email, phoneNumber } = req.body;

  try {
    // Find existing contacts
    const Contacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { email: email || null },
          { phoneNumber: phoneNumber || null }
        ]
      }
    });

    if (Contacts.length === 0) {
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
 let primaryContact = Contacts.find(contact => contact.linkPrecedence === 'primary') || Contacts[0];
 const secondaryContacts = Contacts.filter(contact => contact.linkPrecedence === 'secondary');

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
          emails: Contacts.map(contact => contact.email),
          phoneNumbers: Contacts.map(contact => contact.phoneNumber),
          secondaryContactIds: secondaryContacts.map(contact => contact.id)
        }
      });
      
  
    } catch (error) {
       res.status(500).json({ error: 'Error identifying contact', details: error.message });
    }
});


// New GET route for retrieving all contacts
identifyRouter.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.findAll();
    return res.status(200).json({ contacts });
  } catch (error) {
    return res.status(500).json({ error: 'Error retrieving contacts', details: error.message });
  }
});

module.exports = identifyRouter;