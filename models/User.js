const ObjectID = require('mongodb').ObjectID

class User {
  constructor(db) {
    this.collection = db.collection('users');
  }
  async addUser(user) {
    const newUser = await this.collection.insertOne(user);
    return newUser;
  }
  async updateUser(id, update) {
    const objId = new ObjectID(id);
    const updatedUser = await this.collection.updateOne({_id: objId}, update);
    return updatedUser;
  }
  async findUser(user) {
    const foundUser = await this.collection.findOne(user);
    return foundUser;
  }
  async findById(id) {
    var objId = new ObjectID(id);
    const foundUser = await this.collection.findOne({_id: objId});
    return foundUser;
  }
}
module.exports = User;
