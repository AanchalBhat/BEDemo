var mongoose = require('mongoose')
var vendorSchema = mongoose.Schema({

    id:{
        type: String
    },
    ['Contracting Agency ID']:{
        type: String
    },
    ['Contracting Agency Name']:{
        type: String
    },
    PIID:{
        type: String
    },
    ['Modification Number']:{
        type: String
    },
    ['Date Signed']:{
        type:String
    },
    ['Email Address']:{
        type:String
    },
    ['NAICS Code']:{
        type:String
    },
    ['NAICS Description']:{
        type:String
    },
    ['Contractor Name']:{
        type:String
    },
    ['DUNS Number']:{
        type: String
    },
    ['Street']:{
        type:String
    },
    ['Street2']:{
        type:String
    },
    ['Vendor City']:{
        type:String
    },
    ['Vendor Country']:{
        type:String
    },
    ['Vendor Name']:{
        type:String
    },
    ['Vendor Phone Number']:{
        type:String
    },
    ['Vendor State']:{
        type:String
    },
    Zip:{
        type:String
    },
    ['Is Vendor - SBA Certified 8(a) Program Participant']:{
        type:String
    },
    ['Is Vendor - SBA Certified Hub Zone firm']:{
        type:String
    },
    ['Is Vendor - SBA Certified Small Disadvantaged Business']:{
        type:String
    },
    ['Is Vendor - Self-Certifed Small Disadvantaged Business']:{
        type:String
    },
    ['Is Vendor - Service Disabled Veteran Owned Business']:{
        type:String
    },
    ['Is Vendor - Veteran Owned Business']:{
        type:String
    },
    ['Is Vendor - Woman Owned Business']:{
        type:String
    },
    ['Is Vendor - Women Owned Small Business']:{
        type:String
    },
    ['Action Obligation']:{
        type: String
    }
}, { collection: 'FPDS_NG'});

module.exports = mongoose.model('FPDS_NG', vendorSchema);