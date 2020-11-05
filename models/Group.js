const ObjectID = require('mongodb').ObjectID

class Group {
  constructor(db) {
    this.collection = db.collection('groups');
    // this.collection.createIndex({"name": 1})
  }
  async addEntity(group) {
    let groupCopy = {
      name: group.name
    }
    groupCopy.contacts = group.contacts.map(c=>{
    
      return {
        _id: new ObjectID(c._id),
        number: c.number
      }
    })

    const newGroup = await this.collection.insertOne(groupCopy);
    return newGroup;
  }
  async updateEntity(id, update) {
    const objId = new ObjectID(id);
    let groupCopy = {};
    if(update["$set"]) {
      groupCopy = {$set:{
        name: update["$set"].name.trim()
      }}
      groupCopy["$set"].contacts = update["$set"].contacts.map(c=>{
        return {
          _id: new ObjectID(c._id),
          number: c.number
        }
      })
    }

    const updatedGroup = await this.collection.findOneAndUpdate({_id: objId}, groupCopy);
    // const updatedGroup = await this.collection.updateOne({_id: objId}, {$set:update});
    return updatedGroup;
  }
  async findGroup(group) {
    const foundGroup = await this.collection.findOne(group);
    return foundGroup;
  }

  async find(filter, lim, sort = 0, skip = 0) {
    // const foundMessages = await this.collection.aggregate([{$match: filter}]).toArray();
    const foundGroups = await this.collection.find(filter).limit(lim).sort(sort).skip(skip).toArray();
    return foundGroups;

  }
  
  async findGroups(filter) {
    const foundGroups = await this.collection.find(filter).toArray();
    return foundGroups;
  }

  async deleteEntity(id) {
    const objId = new ObjectID(id)
    // const foundMessages = await this.collection.aggregate([{$match: filter}]).toArray();
    const delGroup = await this.collection.findOneAndDelete({_id: objId});
    return delGroup.value;

  }

  async findById(id) {
    var objId = new ObjectID(id);
    const foundGroup = await this.collection.findOne({_id: objId});
    return foundGroup;
  }

  async getSize(filter = {}) {
    return await this.collection.countDocuments(filter);
  }
}
module.exports = Group;
