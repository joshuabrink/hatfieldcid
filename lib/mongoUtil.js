const { MongoClient } = require('mongodb');
const Contacts = require('../models/Contact');
const Messages = require('../models/Message');
const Users = require('../models/User')

require('dotenv').config();

class MongoUtil {
  constructor() {
    const url = process.env.URL2;
    this.client = new MongoClient(url, {useUnifiedTopology: true});
  }
  async init() {
    await this.client.connect().catch((err)=> {  
        console.log(err);
    });
  
    console.log('connected');
    this.db = this.client.db(process.env.DB);
    this.Contacts = new Contacts(this.db);
    this.Messages = new Messages(this.db);
    this.Users = new Users(this.db);
  }
}

module.exports = new MongoUtil();