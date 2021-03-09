var mongoose = require('mongoose')

var agencySchema = mongoose.Schema({
    Agency_ID: String,
    Agency_Name: String,
    Office_Symbol: String
}, {collection: 'Federal_Agency'});
module.exports = mongoose.model('Federal_Agency', agencySchema);