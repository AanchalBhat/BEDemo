var mongoose = require('mongoose')

var subContractorEvaluation = mongoose.Schema({
    sc_duns_no: {
        type: Number,
    },
    sc_name: {
        type: String,
    },
    sc_address: {
        type: String,
    },
    sc_phone: {
        type: String,
    },
    pc_number: {
        type: String,
    },
    sc_value: {
        type: String,
    },
    sc_value_status: {
        type: Boolean,
    },
    sc_value_actual: {
        type: String,
    },
    contract_period_start: {
        type: Date
    },
    contract_period_end: {
        type:  Date
    },
    contract_agency: {
        type: String
    },
    poc: {
        type: String,
    },
    doe: {
        type: String,
    },
    rating: {
        type: Array
    },
    total_ratting: {
        type: Number,
    },
    agency_org: {
        type: String,
    },
    eval_name: {
        type: String,
    },
    eval_phone: {
        type: String,
    },
    eval_signature: {
        type: String,
    },
    eval_date: {
        type: Date,
    },
    status: {
        type: String
    },
    userId: {
        type: String
    }
});
module.exports = mongoose.model('SubContractorEvaluation', subContractorEvaluation);