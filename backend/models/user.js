// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
  name : String,
  _id: Number,
  password: String, 
  admin: Boolean, 
  group: { type: Schema.Types.ObjectId, ref: 'Group' }
});

var GroupSchema = new Schema({
  _creator: { type: Number, ref: 'User' },
  members: [ { type: Schema.Types.ObjectId, ref: 'User' } ]
});

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', UserSchema);