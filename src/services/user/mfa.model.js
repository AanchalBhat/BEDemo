let mongoose = require('mongoose')

let mfaSchema = mongoose.Schema({
    userId: {
        type: String
    },
    code: {
        type: String
    },
    time: {
        type: Number
    }
});
module.exports = mongoose.model('MFA', mfaSchema);