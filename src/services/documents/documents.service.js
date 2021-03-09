const requestHelper = require("../../common/request_helper");
const Joi = require("joi");
const utils = require("../../common/utils");
const ObjectID = require("mongodb").ObjectID;
class DocumentService {
  constructor(DocumentModel) {
    this.DocumentModel = DocumentModel;
    this.getDocument = this.getDocument.bind(this);
    this.updateDocument = this.updateDocument.bind(this);
    this.deleteDocument = this.deleteDocument.bind(this);
    this.createDocument = this.createDocument.bind(this);
    this.getPaginatedDocuments = this.getPaginatedDocuments.bind(this);
    this._response = {
      status: true,
      message: "Server error! Please try again later",
    };
  }

  /*Get Documents */
  async getDocument(req) {
    try {
      let result = await this.DocumentModel.find({
        _id: ObjectID(req.params.id),
      });
      if (result) {
        this._response = { status: true, document: result };
        return requestHelper.respondWithJsonBody(200, this._response);
      } else {
        this._response = {
          status: false,
          message: "No data found!",
          data: null,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
    } catch (err) {
      this._response = { status: false, message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }

  /* Create new User Document */
  async createDocument(req) {
    try {
      let id = req.user._id;
      let body = req.body;
      const document = new this.DocumentModel({
        provider: req.user.id,
        documentId: req.body.documentId,
        authority: body.authority,
        acquisition: body.acquisition,
        officeSymbol: body.officeSymbol,
        title: body.title,
        NAICSCode: body.NAICSCode,
        organization: body.organization,
        requirements: body.requirements,
        involvement: body.involvement,
        techSource: body.techSource,
        sources: body.sources,
        companyScale: body.companyScale,
        companyType: body.companyType,
        sourceSummary: body.sourceSummary,
        addSource: body.addSource,
        characteristic: body.characteristic,
        extentMarket: body.extentMarket,
        businessPractices: body.businessPractices,
        compileData: body.compileData,
        issues: body.issues,
        consideration: body.consideration,
        isSubmitted: body.isSubmitted,
        involvementTableData: body.involvementTableData,
        compileDataTable: body.compileDataTable,
        issues_amt: body.issues_amt,
        price_value: body.price_value,
        createdAt: Date.now(),
      });
      await document.save();
      this._response = {
        status: true,
        message: "Document Created !!",
        document,
      };
      return requestHelper.respondWithJsonBody(200, this._response);
    } catch (err) {
      this._response = { message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }

  /*Update user document data */
  async updateDocument(req) {
    try {
      let id = req.body._id;
      let body = req.body;
      let result = await this.DocumentModel.updateOne(
        { _id: id },
        { $set: body }
      );
      console.log(result);
      if (result) {
        this._response = {
          status: true,
          message: "updated successfully",
          data: result,
          document: body,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      } else {
        this._response = {
          status: true,
          message: "error while updating",
          data: null,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
    } catch (err) {
      console.log(err);
      this._response = { message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }

  async deleteDocument(req) {
    try {
      let id = req.body._id;
      let body = req.body;
      const schema = Joi.object().keys({
        _id: Joi.string().required(),
      });
      await utils.validate(body, schema);
      let result = await this.DocumentModel.deleteOne({ _id: id });
      if (result) {
        this._response = {
          status: true,
          message: "Deleted successfully",
          data: result,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      } else {
        this._response = {
          status: true,
          message: "error while Deleting",
          data: null,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
    } catch (err) {
      this._response = { message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }

  async getPaginatedDocuments(req) {
    const { agencyCode, searchTerm, limit, offset, onlyUser } = req.query;
    const regexSearchTerm = new RegExp(`^${searchTerm || ""}`, "i");
    const query = {
      organization: agencyCode,
      isSubmitted: true,
      $or: [
        { documentId: regexSearchTerm },
        { provider: regexSearchTerm },
        { officeSymbol: regexSearchTerm },
        { NAICSCode: regexSearchTerm },
        { title: regexSearchTerm },
      ],
    };
    if (Boolean(onlyUser)) {
      query["provider"] = req.user.id;
      delete query["isSubmitted"];
    }
    const select = {
      documentId: 1,
      title: 1,
      officeSymbol: 1,
      provider: 1,
      NAICSCode: 1,
      isSubmitted: 1,
      createdAt: 1,
    };
    const documentCount = await this.DocumentModel.find(query).countDocuments();
    const documents = await this.DocumentModel.find(query, select)
      .sort({ isSubmitted: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    this._response = {
      status: true,
      documents,
      total: documentCount,
      page: Math.floor(parseInt(offset) / parseInt(limit)),
    };
    return requestHelper.respondWithJsonBody(200, this._response);
  }

  async generateDocumentId(agencyId) {
    const randomCharCode = Math.floor(Math.random() * 25);
    const randomChar = String.fromCharCode(65 + randomCharCode);
    const agencyCode = this.paddWithChar(agencyId, 6, "0");
    const fisicalDigit = this.getFYDigit();
    const counter = await this.getCounter(agencyCode, fisicalDigit);
    return `${randomChar}${agencyCode}-${fisicalDigit}-${counter}`;
  }

  paddWithChar(str, len, char) {
    while (str.length < len) {
      str = char + str;
    }
    return str;
  }

  getFYDigit() {
    return new Date().getFullYear().toString().substring(2);
  }

  async getCounter(agencyCode, fisicalDigit) {
    const pattern = new RegExp(`.${agencyCode}-${fisicalDigit}-......`);
    const documents = await this.DocumentModel.find({ documentId: pattern });
    const ids = documents.map((document) => {
      const docArr = document.documentId.split("-");
      return docArr[docArr.length - 1];
    });
    if (ids.length > 0) {
      let id = parseInt(ids.sort().reverse()[0]);
      id += 1;
      return this.paddWithChar("" + id, 6, "0");
    } else {
      return "000001";
    }
  }
}
module.exports = DocumentService;
