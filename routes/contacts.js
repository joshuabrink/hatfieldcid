const express = require('express');
const router = express.Router();
const {Contacts} = require('../lib/mongoUtil');
const routeUtil = require('../lib/routeUtility')
const {get, filter,find, deleteEntity, updateEntity, addEntity, cacheData} = new routeUtil(Contacts);


const { ensureAuthenticated } = require('../lib/auth');

// Contacts.collection.createIndex({"name": 1, "number": 1})
// Contacts.collection.createIndex({name: "text", company: "text", number: "text", email: "text"})


router.get('/contacts', ensureAuthenticated, cacheData, get)

router.post('/searchContacts', ensureAuthenticated, filter,cacheData, get)

router.post('/deleteContact', ensureAuthenticated, deleteEntity,get)

router.post('/contactsFilter', ensureAuthenticated, filter,cacheData, get)

router.post('/updateContact', ensureAuthenticated, updateEntity, get)

router.post('/findContact', ensureAuthenticated, find, get)

// router.get('/contacts',  ensureAuthenticated, (req, res) => {
//     Contacts.findContacts({}).then((contacts) => {
//         res.render('contacts', {title: 'Contacts',contacts: contacts})
//     }).catch(err => console.log(err))
    
// })
router.post('/addContact',  ensureAuthenticated, addEntity, get);

// router.post('/addContact',  ensureAuthenticated, (req,res) => {
//     const {name, number, email, group, company} = req.body;

//      const current_datetime = new Date();
//     const date = current_datetime.toLocaleString();

//     const newContact = {
//         name,
//         number,
//         email, 
//         group, 
//         company
//     }

//     Contacts.addContact(newContact).then((contact) => {
//         // res.redirect('/contacts');
//         res.send('success')
//     })
//     .catch(err => 
//        res.send('error')
//         );

// })

module.exports = router;