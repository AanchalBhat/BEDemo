const mongoose = require('mongoose')

const sams = mongoose.Schema({
    DUNS: Number,
    DUNS_PLUS_4: String,
    CAGE_CODE: String,
    ACTIVATION_DATE: Date,
    LEGAL_BUSINESS_NAME: String,
    DBA_NAME: String,
    PHYSICAL_ADDRESS_LINE_1: String,
    PHYSICAL_ADDRESS_LINE_2: String,
    PHYSICAL_ADDRESS_CITY: String,
    PHYSICAL_ADDRESS_PROVINCE_OR_STATE: String,
    PHYSICAL_ADDRESS_ZIP_POSTAL_CODE: String,
    PHYSICAL_ADDRESS_ZIP_CODE_v4: String,
    PHYSICAL_ADDRESS_COUNTRY_CODE: String,
    PRIMARY_NAICS: String,
    NAICS_CODE_STRING: String,
    GOVT_BUS_POC_FIRST_NAME: String,
    GOVT_BUS_POC_MIDDLE_INITIAL: String,
    GOVT_BUS_POC_LAST_NAME: String,
    GOVT_BUS_POC_TITLE: String,
    GOVT_BUS_POC_US_PHONE: String,
    GOVT_BUS_POC_US_PHONE_EXT: String,
    GOVT_BUS_POC_NON_US_PHONE: String,
    GOVT_BUS_POC_FAX_US_ONLY: String,
    GOVT_BUS_POC_EMAIL: String
})

module.exports = mongoose.model('SamsData', sams, process.env.DB_SAMS)