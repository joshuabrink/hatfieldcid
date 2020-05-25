const express = require('express');
const router = express.Router();
const {Messages} = require('../lib/mongoUtil');
const{Contacts}  = require('../lib/mongoUtil');

const { ensureAuthenticated } = require('../lib/auth');

router.get('/messages',  ensureAuthenticated, (req, res) => {
    Messages.findMessages({}).then((messages) => {
        var promises = messages.map( message => {
             return Contacts.findContact({number: message.number}).then(contact => {
                message.name = contact.name;
                return message;
            }).catch(err => console.log(err))
            
        })

        Promise.all(promises).then(msgs => {
            res.render('messages', {title: 'Messages', messages: msgs})
        })
          
    }).catch(err => console.log(err))
    
})

module.exports = router;