const express = require('express');
const router = express.Router();
const { Groups} = require('../lib/mongoUtil');
const routeUtil = require('../lib/routeUtility')

const { ensureAuthenticated } = require('../lib/auth');
const {get, filter, deleteEntity, updateEntity, addEntity, cacheData} = new routeUtil(Groups);

router.get('/groups', ensureAuthenticated, cacheData, get)

router.post('/addGroup',  ensureAuthenticated, addEntity, get)


router.post('/searchGroups', ensureAuthenticated, filter,cacheData, get)

router.post('/deleteGroup', ensureAuthenticated, deleteEntity,get)

router.post('/groupsFilter', ensureAuthenticated, filter,cacheData, get)

router.post('/updateGroup', ensureAuthenticated, updateEntity, get)

router.post('/findDistinctGroups', ensureAuthenticated, (req,res,next)=>{
   
    Groups.findProjection({}, {_id:1, name: 1}).then(found => {
        res.send(found);
    })
})


module.exports = router;