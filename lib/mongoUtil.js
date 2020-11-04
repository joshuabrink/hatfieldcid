const { MongoClient } = require('mongodb');
const Groups = require('../models/Group');
const Contacts = require('../models/Contact');
const Messages = require('../models/Message');
const Users = require('../models/User')

require('dotenv').config();

class MongoUtil {
  constructor() {
    const url = process.env.URL;
    this.client = new MongoClient(url, {useUnifiedTopology: true});
  }
  async init() {
    await this.client.connect().catch((err)=> {  
        console.log(err);
    });
  
    console.log('connected');
    this.db = this.client.db(process.env.DB);
    this.Contacts = new Contacts(this.db);
    this.Groups = new Groups(this.db);
    this.Messages = new Messages(this.db);
    this.Users = new Users(this.db);

  
  }

  async populateGroups() {

    this.Contacts.findDistinct("group").then(groups => {
      groups.forEach(group => {
        this.Contacts.findProjection({group: [group]},{number: 1}).then(contacts => {
          this.Groups.addEntity({name: group, contacts: contacts})
        })
      });
      
    })
  }

  async createIndex() {
    // Groups.collection.createIndex({"name": 1})
    // //CREATE MESSAGE INDEXES
    // // Messages.createIndex({"name": 1, "number": 1})
    // Messages.collection.createIndex({"contact.name": 1, "contact.number": 1})
    // Messages.collection.createIndex({message: "text"})
   
    // Contacts.collection.createIndex({name: "text", company:"text",email:"text"})

  }
}

module.exports = new MongoUtil();