const { Messages, Contacts, Groups } = require("../lib/mongoUtil");
const moment = require("moment");

// const redis = require("redis");
// const util = require("util");
// const { info } = require("console");

//Start cache server
// const client = redis.createClient(process.env.REDIS_URL);
// client.hget = util.promisify(client.hget);

class RouteUtil {
  constructor(collection) {
    this.collection = collection;
    this.type = this.collection.collection.collectionName;
    this.data = null;
    this.async = false;
    this.redisKey = null;
    this.cached = false;
    this.query = { sort: 0, limit: 25, page: 0 }

    // if (this.type == "messages") {
    //   this.query = {...this.query, message: { $regex: "", $options: "i" }}; 
    // } else {
    //   this.query = {...this.query, name: { $regex: "", $options: "i" }};
    // }
  }

  ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      req.filter = null;
      return next();
    }
    res.redirect("/login");
  };

  async formatData(formatedFilter) {
    if (this.type == "messages") {
      if (
        this.data &&  this.data[0] &&
        !moment(this.data[0].date, "DD/MM/YY h:mm a").isValid()
      ) {
        this.data.map((row) => {
          if (!moment(row.date, "DD/MM/YY, h:mm a").isValid()) {
            row.date = moment(row.date).format("DD/MM/YY, h:mm a");
          }
        });
      }
    }

    if (this.type == "groups") {
      for (let i = 0; i < this.data.length; i++) {
        // let gContactList = [];

        this.data[i].contacts = await this.setGroupContacts(this.data[i].name);

        // this.data[i].contacts = await this.setGroupContacts(
        //   gContactList,
        //   this.data[i].contacts
        // );
      }
    }


    await this.collection.getSize(formatedFilter).then((numDocs) => {
      this.totalDocs = numDocs;
      this.data = { total: this.totalDocs, data: this.data };
    });

  }

  cacheData = (req, res, next) => {
    // let object = Object.assign({}, this.query, { collection: this.type });
    // this.redisKey = JSON.stringify(object);

    // // const cacheValue = await client.hget(this.type, key);
    // client.hget(this.type, this.redisKey).then((cacheValue) => {
    //   if (cacheValue) {
    //     const doc = JSON.parse(cacheValue); // converting back to original datatype from string

    //     /* While storing data in redis we may store a single object or an array of objects.
    //      * We need to convert normal json into mongoose model instance before returning to app.js,
    //      * this.model() is used for this purpose
    //      */
    //     this.data = Array.isArray(doc) ? doc.map((d) => d) : doc;
    //     this.cached = true;
    //     return next();
    //   }
    //   this.cached = false;

    //   return next();
    // });
    return next();
  };

  clearCache = () => {
    // client.del(this.type);
  };

  resetConfig = () => {
    this.async = this.data = this.cached = false;
    this.query = { sort: 0, limit: 25, page: 0 }

    // if (this.type == "messages") {
    //   this.query = {...this.query, message: { $regex: "", $options: "i" }}; 
    // } else {
    //   this.query = {...this.query, name: { $regex: "", $options: "i" }};
    // }

  };

  getNewData = (req, res) => {
    let keys = Object.keys(this.query);
    let filteredKeys = keys.filter(
      (key) => !["limit", "sort", "page"].includes(key)
    );
    let formatedFilter = filteredKeys.reduce((result, key) => {
      result[key] = this.query[key];
      return result;
    }, {});

    this.collection
      .find(
        formatedFilter,
        this.query["limit"],
        this.query["sort"],
        this.query["page"]
      )
      .then((rows) => {
        this.data = rows;
        this.formatData(formatedFilter).then(() => {
          // client.hset(this.type, this.redisKey, JSON.stringify(this.data));
          if (this.async) {
            res.send(this.data);
          } else {
            res.render(this.type, { title: this.type, [this.type]: this.data });
          }

          this.resetConfig();
        });
      })
      .catch((err) => console.log(err));
  };

  get = (req, res, next) => {
    // this.clearCache(this.redisKey);

    // client.flushall();

    //ASYNC calls to send data to frontend
    if (this.async) {
      if (this.cached || this.data) {
        res.send(this.data);
        this.resetConfig();
      } else {
        this.getNewData(req, res);
      }
    }

    //Load Pages
    else {
      if (this.cached || this.data) {
        res.render(this.type, { title: this.type, [this.type]: this.data });
        this.resetConfig();
      } else {
        this.getNewData(req, res);
      }
    }

  };

  filter = (req, res, next) => {
    // if(this.cached) {
    //   return next();
    // }

    let filter = req.body;
    req.filter = true;

    let formatedFilter = {};
    let limit = 25;
    let page = 0;
    let sort = {};
    let partialSearch = {
      $regex: req.body.term,
      $options: "i",
    };

    Object.keys(filter).forEach((key) => {
      if (key === "limit") {
        limit = parseInt(filter["limit"]);
        //   let newPair = { $limit: filter['amount'] };
        //   formatedFilter = { ...formatedFilter, ...newPair }
      } else if (key === "sort") {
        sort = filter["sort"]; //assign value to sort obj
      } else if (key === "page") {
        page = filter["page"] * limit;
      } else if (key === "group") {
        let group = { group: filter["group"] };
        formatedFilter = { ...formatedFilter, ...group };
      } else if (key === "term") {
        let search = {};
        if (this.type == "contacts") {
          search = {
            $or: [
              {
                name: partialSearch,
              },
              {
                number: partialSearch,
              },
              {
                email: partialSearch,
              },
              {
                company: partialSearch,
              },
            ],
          };
        } else if (this.type == "groups") {
          search = {
            name: partialSearch,
          };
        } else {
          search = {
            $or: [
              {
                message: partialSearch,
              },
              {
                "contact.name": partialSearch,
              },
              {
                "contact.number": partialSearch,
              },
            ],
          };
        }

        formatedFilter = { ...formatedFilter, ...search };
      }
    });

    this.query = { ...formatedFilter, sort: sort, limit: limit, page: page };
    this.async = req.body.async;

    //  if(this.cached) {
    return next();
    //  }

    // this.collection
    //   .find(formatedFilter, limit, sort, page)
    //   .then(async (rows) => {
    //     this.data = rows;

    //     await this.collection.getSize(formatedFilter).then((numDocs) => {
    //       this.totalDocs = numDocs;
    //       return next();
    //     });
    //   })
    //   .catch((err) => console.log(err));
  };

  deleteEntity = (req, res, next) => {
    let id = req.body._id;

    

    this.collection
      .deleteEntity(id)
      .then((entity) => {

        if(this.type == 'groups') {
          let promise = this.updateAllGroupContacts(entity, false)
  
          Promise.resolve(promise).then((group) => {
            this.data = {};
            this.async = req.body.async;
            // this.clearCache();
            return next();
          })
        } else {
          this.data = {};
          this.async = req.body.async;
          // this.clearCache();
          return next();
        }
    
        
      })
      .catch((err) => {
        res.send("error");
      });
  };

  updateEntity = (req, res, next) => {
    const body = req.body;
    this.data = {};
    for (let key in body) {
      if (key == "id") this.data["_id"] = body[key];
      else this.data[key] = body[key];
    }
    this.data = [this.data];
    const { id } = req.body;

    delete body["id"];
    delete body["optIn"];
    delete body["async"];

    this.collection
      .updateEntity(id, {$set:body})
      .then((updatedGroup) => {
        this.async = this.data[0].async;
        // this.clearCache();
        if(this.type == 'group') {
          let changedContacts = updatedGroup.contacts
                 .filter(x => !req.body.contacts.includes(x))
                 .concat(req.body.contacts.filter(x => !updatedGroup.contacts.includes(x)));
          for (let i = 0; i <changedContacts.length; i++) {
            const element = array[i];
            
          }
                 this.updateContactGroups(changedContacts, req.body.name,)
          // Contacts.updateEntity()
          
        }

        return next();
      })
      .catch((err) => {
        console.log(err);
      });
  };


  setGroupContacts = (group) => {
    return new Promise((resolve, reject) => {
      // let contact = {};

      // let number = contacts[i].number.replace(/^27/g, "0");
      let contacts = Contacts.find({ group: group }, 0).catch((err) =>
        console.log(err)
      );

      Promise.resolve(contacts).then((contact) => {
        resolve(contacts);
      });
    });
  };

  updateContactGroups = (contact, groupName, queryType)=> {
    return new Promise((resolve, reject) => {

      let query = { }
      if(queryType) {
        query = {$push: { group: groupName }}
      } else {
        query = {$pull: { group: groupName } }
      }
      Contacts.updateEntity(contact._id,query).then(contact=>{
        return resolve(contact)
   
      })
    })
  }

  updateAllGroupContacts = (group, queryType)=> {
    return new Promise(async (resolve, reject) => {
        
      for (let i = 0; i < group.contacts.length; i++) {
        
          if(i == group.contacts.length-1) {
            group.contacts[i] = await this.updateContactGroups(group.contacts[i], group.name, queryType)
            return resolve(group);
          } else {
            group.contacts[i] = await this.updateContactGroups(group.contacts[i], group.name, queryType)
          }
      }

  })
  }


  addEntity = (req, res, next) => {
    if (this.type == "contacts") {
      const { name, number, email, group, company } = req.body;

      const current_datetime = new Date();
      const date = current_datetime.toLocaleString();

      const newContact = {
        name,
        number,
        email,
        group,
        company,
      };

      this.collection
        .addEntity(newContact)
        .then((contact) => {
          // res.redirect('/contacts');
          this.async = req.body.async;
          this.data = newContact;
          // this.clearCache();
          return next();
        })
        .catch((err) => res.send("error"));
    } else if (this.type == "groups") {
      const { name, contacts } = req.body;

      let group = {
        name: name,
        contacts: contacts
      };

      this.collection.addEntity(group).then((g) => {
        let promise = this.updateAllGroupContacts(group, true);
        Promise.resolve(promise).then((cList) => {
          this.async = req.body.async;
          this.data = group;
          // this.clearCache();
          return next();
        })
      })
      

    } else {
      const { contacts, groups, message } = req.body;

      const date = new Date(Date.now()).toISOString();
      let msg = { message: message, date: date };
      msg.contacts = contacts;
      msg.groups = groups;
      // let contactList = [];
      // let setPromise = this.setMesageContact(contactList, numbers);
      let groupContacts = []

      let promise = new Promise((resolve, reject) => {
        for (let i = 0; i <groups.length; i++) {
          Groups.find({name: groups[i]}, 0).then(g=>{
            if(g[0]) {
              groupContacts.push(g[0].contacts.map(c=>{return c.number.replace(/^0/g, '27')}))
            } else {
              reject('group not found')
            }
            if(i == groups.length-1) {
              resolve(groupContacts)
            }
          })
          
        }
       

      })

      Promise.resolve(promise).then((cList) => {

        this.collection
          .addEntity(msg)
          .then((message) => {
            this.async = req.body.async;
            this.data = { contacts: contacts, groups:groups };
            this.clearCache();
            let allNumbers = contacts.map(c=>{return c.number.replace(/^0/g, '27')}).concat(cList.flat(1))

        //  await SMS.sendBulk(allNumbers, message).then(response => {
            //   return next();
            // });

            return next();

            // res.send({ numbers: numbers })
          })
          .catch((err) => {
            res.send({ error: err });
          });
      });

    
    }
  };
}

module.exports = RouteUtil;
