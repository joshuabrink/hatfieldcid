const express = require('express');
const router = express.Router();
const { Messages } = require('../lib/mongoUtil');
const mongo = require('../lib/mongoUtil');
const moment = require('moment');
const routeUtil = require('../lib/routeUtility')

// const {get, filter, deleteEntity} = require('../lib/routeUtility')

const {get, filter, deleteEntity,ensureAuthenticated} = new routeUtil(Messages);



// const { ensureAuthenticated } = require('../lib/auth');

// function formatDate(messages) {
//     messages.map((message)=> {
      
//       message.date = moment(message.date).format("Do MMMM YYYY, h:mm a");
//     })
//     return messages;
//   }

// function get(req ,res) {

//     if(req.async) {
//         res.send(formatDate(req.messages))
//     } else if(req.messages) {

//         res.render('messages', { title: 'Messages', messages: formatDate(req.messages)})
//     } else {
//         Messages.findMessages({}, 10).then((messages) => {

//             res.render('messages', { title: 'Messages', messages: formatDate(messages) })
    
//         }).catch(err => console.log(err))
//     }
// }

// function search(req ,res, next) {
//     let term = req.body.term;


//     let partialSearch = {
//         $regex: term,
//         '$options': "i"
//     }

//     let fullSearch = {
//         $text: { $search: term }
//     }

//     let filter = {
//         $or: [
//         {
//             message: partialSearch
//         },
//         {
//             "contact.name": partialSearch
//         },
//         {
//             "contact.number": partialSearch
//         }
//         ]
//     }

//     // mongo.createIndex(Messages.collection); 
//     Messages.findMessages(filter, 10).then((messages) => {

//         req.async = req.body.async;
//         req.messages = messages;
//         return next();

//     }).catch(err => console.log(err))
// }

// function filter(req, res, next) {
//     let filter = req.body;
//     let formatedFilter = {};
//     let limit = -1;
//     let sort = {};

//     Object.keys(filter).forEach(key => {
//         if (key === 'limit') {
//             limit = filter['limit'];
//             //   let newPair = { $limit: filter['amount'] };
//             //   formatedFilter = { ...formatedFilter, ...newPair }
//         } else if(key === 'sort') {
             
//             sort = filter['sort'] //assign value to sort obj
            
//         } 
//     });

// let s =    Messages.collection.collectionName;

//     Messages.findMessages(formatedFilter, limit, sort).then((messages) => {
//         req.async = req.body.async;
//         req.messages = messages;
//         return next()

//     }).catch(err => console.log(err))
// }

// function deleteEntity(req, res, next) {
//     let id = req.body._id;

//     let async = req.body.async;

//     // res.send({ msg: 'success' })

//     Messages.deleteMessage(id).then((message) => {
   
//         req.async = req.body.async;
//         req.messages = messages;
//         return next();

//     }).catch(err => {
//         console.log(err)
//     })

// }


router.get('/messages', ensureAuthenticated, get)

router.post('/searchMessages', ensureAuthenticated, filter, get)

router.post('/deleteMessage', ensureAuthenticated, deleteEntity,get)

router.post('/messagesFilter', ensureAuthenticated, filter, get)

module.exports = router;