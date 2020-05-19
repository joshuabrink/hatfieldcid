const ObjectID = require('mongodb').ObjectID

class Message {
  constructor(db) {
    this.collection = db.collection('messages');
  }
  async addMessage(message) {
    const newMessage = await this.collection.insertOne(message);
    return newMessage;
  }
  async updateMessage(id, update) {
    const objId = new ObjectID(id);
    const updatedMessage = await this.collection.updateOne({_id: objId}, update);
    return updatedMessage;
  }
  async findMessage(message) {
    const foundMessage = await this.collection.findOne(message);
    return foundMessage;
  }

  async findMessages(filter) {

    const foundMessages = await this.collection.find(filter).toArray();
    return foundMessages;

  }

  async findById(id) {
    var objId = new ObjectID(id);
    const foundMessage = await this.collection.findOne({_id: objId});
    return foundMessage;
  }
}
module.exports = Message;
