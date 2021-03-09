const mongoose = require("mongoose");

const priceMatrix = mongoose.Schema({
  documentId: { type: String },
  description: { type: String },
  governmentCosts: { type: Number },
  historicalPrice: { type: Number },
  catalogPrice: { type: Number },
  averagePrice: { type: Number },
  plusAvg: { type: Number },
  agencyCode: { type: String },
  complete: { type: Boolean },
});

module.exports = mongoose.model("price_matrix", priceMatrix);
