const requestHelper = require("../../common/request_helper");
const ObjectID = require("mongodb").ObjectID;

class PriceMatrix {
  constructor(PriceMatrixModel) {
    this.PriceMatrixModel = PriceMatrixModel;
    this.getPaginatedMatrix = this.getPaginatedMatrix.bind(this);
    this.deleteMatrixForDocument = this.deleteMatrixForDocument.bind(this);
    this.addMatrix = this.addMatrix.bind(this);
    this.updateMatrix = this.updateMatrix.bind(this);
    this.handleMatrix = this.handleMatrix.bind(this);
    this.getAllForDocument = this.getAllForDocument.bind(this);
    this._response = {};
  }

  getPaginatedMatrix = async (req) => {
    const regexSearchTerm = new RegExp(`^${req.query.searchTerm || ""}`, "i");
    const query = {
      agencyCode: req.query.agencyCode,
      complete: true,
      $or: [{ documentId: regexSearchTerm }, { description: regexSearchTerm }],
    };

    const docCount = await this.PriceMatrixModel.find(query).countDocuments();

    const matrix = await this.PriceMatrixModel.find(query)
      .limit(parseInt(req.query.limit))
      .skip(parseInt(parseInt(req.query.offset)));

    this._response = {
      status: true,
      matrix,
      page: Math.floor(parseInt(req.query.offset) / parseInt(req.query.limit)),
      total: docCount,
    };

    return requestHelper.respondWithJsonBody(200, this._response);
  };

  getAllForDocument = async (documentId) => {
    const results = await this.PriceMatrixModel.find({ documentId });
    return results;
  };

  addMatrix = async (matrix) => {
    const priceMatrix = new this.PriceMatrixModel({ ...matrix });
    await priceMatrix.save();
  };

  updateMatrix = async (matrix) => {
    const priceMatrix = await this.PriceMatrixModel.updateOne(
      { _id: ObjectID(matrix._id) },
      { $set: matrix }
    );
  };

  deleteMatrixForDocument = async (documentId) => {
    return this.PriceMatrixModel.deleteMany({ documentId });
  };

  handleMatrix = async (matrixArray, documentId, agencyCode, status) => {
    await this.deleteMatrixForDocument(documentId);
    for (let i = 0; i < matrixArray.length; i++) {
      matrixArray[i].documentId = documentId;
      matrixArray[i].complete = status;
      matrixArray[i].agencyCode = agencyCode;
      matrixArray[i].governmentCosts = parseFloat(
        matrixArray[i].governmentCosts
      );
      matrixArray[i].historicalPrice = parseFloat(
        matrixArray[i].historicalPrice
      );
      matrixArray[i].plusAvg = parseFloat(matrixArray[i].plusAvg);
      matrixArray[i].catalogPrice = parseFloat(matrixArray[i].catalogPrice);
      matrixArray[i].averagePrice = parseFloat(matrixArray[i].averagePrice);
      await this.addMatrix(matrixArray[i]);
    }
  };
}

module.exports = PriceMatrix;
