const ObjectID = require('mongodb').ObjectID

class Contact {
  constructor(db) {
    this.collection = db.collection('contacts');
 
    // this.collection.createIndex({name: "text", company:"text",email:"text"})
  }
  async addEntity(contact) {
    const newContact = await this.collection.insertOne(contact);
    return newContact.ops[0];
  }
  async updateEntity(id, update) {
    const objId = new ObjectID(id);
    const updatedContact = await this.collection.findOneAndUpdate({_id: objId}, update);
    // const updatedContact = await this.collection.updateOne({_id: objId}, {$set:update});
    return updatedContact.value;
  }
  async findContact(contact) {
    const foundContact = await this.collection.findOne(contact);
    return foundContact;
  }

  async findProjection(filter, projection) {
    const foundContacts = await this.collection.find(filter).project(projection).toArray();
    return foundContacts;

  }

  async find(filter, lim, sort = 0, skip = 0) {
    // const foundMessages = await this.collection.aggregate([{$match: filter}]).toArray();
    const foundContacts = await this.collection.find(filter).limit(lim).sort(sort).skip(skip).toArray();
    return foundContacts;

  }


  async findDistinct(field) {
    const foundContacts = await this.collection.distinct(field, {});
    return foundContacts;

  }
  
  async findContacts(filter) {
    const foundContacts = await this.collection.find(filter).toArray();
    return foundContacts;
  }

  async deleteEntity(id) {
    const objId = new ObjectID(id)
    // const foundMessages = await this.collection.aggregate([{$match: filter}]).toArray();
    const delContact = await this.collection.findOneAndDelete({_id: objId});
    return delContact.value;

  }

  async findById(id) {
    var objId = new ObjectID(id);
    const foundContact = await this.collection.findOne({_id: objId});
    return foundContact;
  }

  async getSize(filter = {}) {
    return await this.collection.countDocuments(filter);
  }
}
module.exports = Contact;
