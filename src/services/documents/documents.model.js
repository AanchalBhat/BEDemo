var mongoose = require("mongoose");
var docSchema = mongoose.Schema({
  documentId: {
    type: String,
  },
  provider: {
    type: String,
  },
  authority: {
    type: String,
  },
  acquisition: {
    type: String,
  },
  officeSymbol: {
    type: String,
  },
  title: {
    type: String,
  },
  NAICSCode: {
    type: String,
  },
  organization: {
    type: String,
  },
  requirements: {
    type: String,
  },
  involvement: {
    type: String,
  },
  techSource: {
    type: String,
  },
  sources: {
    type: Array,
  },
  companyScale: {
    type: String,
  },
  companyType: {
    type: String,
  },
  sourceSummary: {
    type: String,
  },
  addSource: {
    type: String,
  },
  characteristic: {
    type: String,
  },
  extentMarket: {
    type: String,
  },
  businessPractices: {
    type: String,
  },
  compileData: {
    type: String,
  },
  issues: {
    type: String,
  },
  issues_amt: {
    type: Number,
  },
  consideration: {
    type: String,
  },
  createdAt: {
    type: Date,
    //parseInt(today.getMonth()+1) +"/"+ today.getDate() + "/"+today.getFullYear()
  },
  isSubmitted: {
    type: Boolean,
  },
  involvementTableData: {
    type: Array,
  },
  compileDataTable: {
    type: Array,
  },
  price_value: {
    type: Number,
  },
});
module.exports = mongoose.model("User_Document", docSchema);
