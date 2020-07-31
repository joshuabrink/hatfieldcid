const express = require('express');
const router = express.Router();
const {Contacts} = require('../lib/mongoUtil');

const { ensureAuthenticated } = require('../lib/auth');

router.get('/contacts',  ensureAuthenticated, (req, res) => {
    Contacts.findContacts({}).then((contacts) => {
        res.render('contacts', {title: 'Contacts',contacts: contacts})
    }).catch(err => console.log(err))
    
})

router.post('/addContact',  ensureAuthenticated, (req,res) => {
    const {name, position, number} = req.body;

     const current_datetime = new Date()
    const date = current_datetime.toLocaleString();

    const newContact = {
        name,
        position,
        number,
        date
    }

    Contacts.addContact(newContact).then((contact) => {
        console.log(contact + " added")
        res.redirect('/contacts');
    }).catch(err => console.log(err));

})

module.exports = router;