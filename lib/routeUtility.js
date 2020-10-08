
const { Messages, Contacts } = require('../lib/mongoUtil');
const moment = require('moment');

class RouteUtil {

    constructor(collection) {
        this.collection = collection;
        this.type = this.collection.collection.collectionName;
        this.data = null;
        this.async = false;
    }

    ensureAuthenticated = (req, res, next) => {
        if (req.isAuthenticated()) {
            req.filter = null;
            return next();
        }
        res.redirect('/login');
    }

     async formatData() {

        if(!this.totalDocs) {
            await this.collection.getSize().then(numDocs => { 
                this.totalDocs = numDocs;
            })
        }
   
            if (this.type == 'messages') {

                if (this.data && !moment(this.data[0].date, "DD/MM/YY h:mm a").isValid()) {
                    this.data.map((row) => {
                        if (!moment(row.date, "DD/MM/YY, h:mm a").isValid()) {
                            row.date = moment(row.date).format("DD/MM/YY, h:mm a");
                        }
                    })
                }
            }

            this.data = {total:this.totalDocs, data:this.data}

        
    }


    get = (req, res) => {

        if (this.async && this.data) {
            this.formatData().then(()=> {
               
                res.send(this.data)
                this.async = false;
                this.data = null;
            }) 
        
        } else {
            this.collection.find({}, 25).then((rows) => {
                this.data = rows;
                this.formatData().then(()=> {
                    res.render(this.type, { title: this.type, [this.type]: this.data }) 
                })
                                
            }).catch(err => console.log(err))
        }
    };

    filter = (req, res, next) => {
        let filter = req.body;
        req.filter = true;

        let formatedFilter = {};
        let limit = 25;
        let page = 0;
        let sort = {};
        let partialSearch = {
            $regex: req.body.term,
            '$options': "i"
        }

        Object.keys(filter).forEach(key => {
            if (key === 'limit') {

                limit = parseInt(filter['limit']);
                //   let newPair = { $limit: filter['amount'] };
                //   formatedFilter = { ...formatedFilter, ...newPair }
            } else if (key === 'sort') {

                sort = filter['sort'] //assign value to sort obj

            } else if(key === 'page') {

                page = filter['page'] * limit;
            }
            
            else if (key === 'term') {
                let search = {}
                if (this.type == 'contacts') {
                    search = {
                        $or: [
                            {
                                name: partialSearch
                            },
                            {
                                number: partialSearch
                            },
                            {
                                email: partialSearch
                            },
                            {
                                company: partialSearch
                            }
                        ]
                    }
                } else {
                    search = {
                        $or: [
                            {
                                message: partialSearch
                            },
                            {
                                "contact.name": partialSearch
                            },
                            {
                                "contact.number": partialSearch
                            }
                        ]
                    }
                }

                formatedFilter = { ...formatedFilter, ...search }
            }
        });

        this.collection.find(formatedFilter, limit, sort, page).then(async (rows) => {
            this.async = req.body.async;
            this.data = rows;
            
            await this.collection.getSize(formatedFilter).then(numDocs => { 
                this.totalDocs = numDocs
                return next()
            })
 

        }).catch(err => console.log(err))
    }

    deleteEntity = (req, res, next) => {
        let id = req.body._id;

        this.collection.deleteEntity(id).then((entity) => {
            this.data = true;
            this.async = req.body.async;

            return next();

        }).catch(err => {
            res.send('error')
        })

    }

    updateEntity = (req,res, next) => {
        const body = req.body;
        const {id} = req.body;
        delete body['id'];
        
        this.collection.updateEntity(id, body).then((entity) => {
            this.data = true;
            this.async = req.body.async;

            return next();

        }).catch(err => {
            console.log(err)
        })
    }


    setMesageContact = (contactList) => {
    
        return new Promise((resolve, reject) => {
            for (let i = 0; i < numbers.length; i++) {
              const number = numbers[i].replace(/^27/g, '0');
      
              let contact = { name: '', number: number }
      
              let promise = Contacts.findContact({ number: number }).then(c => {
                contact.name = c.name;
                return contact;
              }).catch(err => console.log(err))
      
              Promise.resolve(promise).then(contact => {
                contactList.push(contact)
                if (contactList.length == numbers.length) {
                  resolve(contactList);
                }
      
              })
            }
          })

    }

    addEntity = (req,res, next)  => {

        if(this.type == "message") {
            const { numbers, message } = req.body;
    
            const date = new Date(Date.now()).toISOString();
            let msg = { message: message, date: date };
            let contactList = [];
        
            let setPromise = this.setMesageContact(contactList)
        
            Promise.resolve(setPromise).then(cList => {
              msg.contact = cList;
        
              this.collection.addMessage(msg).then((message) => {
                this.async = req.body.async;
                this.data = {numbers:numbers};
                return next();
        
                // res.send({ numbers: numbers })
                
              }).catch(err => {
                res.send({ error: err})
            
              });
              
            })
        
            //  await SMS.sendBulk(numbers, message).then(response => {
            //   io.emit('smsStatus', response);
            // });  
        } else {
            const {name, number, email, group, company} = req.body;

            const current_datetime = new Date();
           const date = current_datetime.toLocaleString();
       
           const newContact = {
               name,
               number,
               email, 
               group, 
               company
           }
       
           this.collection.addEntity(newContact).then((contact) => {
               // res.redirect('/contacts');
               this.async = req.body.async;
               this.data =  newContact;
               return next();
           })
           .catch(err => 
              res.send('error')
            );
        }

 
    
      }



}

module.exports = RouteUtil;