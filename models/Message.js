const ObjectID = require('mongodb').ObjectID

class Message {
  constructor(db) {
    this.collection = db.collection('messages');
  }
  async addMessage(message) {
    const newMessage = await this.collection.insertOne(message);
    return newMessage;
  }
  async updateEntity(id, update) {
    const objId = new ObjectID(id);
    const updatedMessage = await this.collection.updateOne({_id: objId}, update);
    return updatedMessage;
  }
  async findMessage(message) {
    const foundMessage = await this.collection.findOne(message);
    return foundMessage;
  }

  async findMessages(filter, lim, sort) {
    // const foundMessages = await this.collection.aggregate([{$match: filter}]).toArray();
    const foundMessages = await this.collection.find(filter).limit(lim).sort(sort).toArray();
    return foundMessages;

  }

  async find(filter, lim, sort) {
    // const foundMessages = await this.collection.aggregate([{$match: filter}]).toArray();
    const foundMessages = await this.collection.find(filter).limit(lim).sort(sort).toArray();
    return foundMessages;

  }
  async deleteEntity(id) {
    const objId = new ObjectID(id)
    // const foundMessages = await this.collection.aggregate([{$match: filter}]).toArray();
    const delMessage = await this.collection.deleteOne({_id: objId});
    return delMessage;

  }

  async findById(id) {
    var objId = new ObjectID(id);
    const foundMessage = await this.collection.findOne({_id: objId});
    return foundMessage;
  }
}
module.exports = Message;
