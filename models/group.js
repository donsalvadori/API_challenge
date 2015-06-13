var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupSchema = new Schema({
    name: String
});

module.exports = mongoose.model('Group', GroupSchema);