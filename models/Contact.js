const ObjectID = require('mongodb').ObjectID

class Contact {
  constructor(db) {
    this.collection = db.collection('contacts');
  }
  async addContact(contact) {
    const newContact = await this.collection.insertOne(contact);
    return newContact;
  }
  async updateContact(id, update) {
    const objId = new ObjectID(id);
    const updatedContact = await this.collection.updateOne({_id: objId}, update);
    return updatedContact;
  }
  async findContact(contact) {
    const foundContact = await this.collection.findOne(contact);
    return foundContact;
  }
  
  async findContacts(filter) {
    const foundContacts = await this.collection.find(filter).toArray();
    return foundContacts;
  }

  async findById(id) {
    var objId = new ObjectID(id);
    const foundContact = await this.collection.findOne({_id: objId});
    return foundContact;
  }
}
module.exports = Contact;
