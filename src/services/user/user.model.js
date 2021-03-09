var mongoose = require('mongoose')

var userSchema = mongoose.Schema({
    userId: {
        type: String
    },
    agency_code: {
        type: String
    },
    phone: {
        type: String
    },
    office_symbol: {
        type: String
    },
    organization: {
        type: String
    },
    firstname: {
        type: String
    },
    middlename: {
        type: String
    },
    lastname: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    role: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: false
    }
});
module.exports = mongoose.model('User', userSchema);