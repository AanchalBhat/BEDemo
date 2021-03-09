const requestHelper = require("../../common/request_helper");
class SamService {
  constructor(SamModel, VendorModel) {
    this.SamModel = SamModel;
    this.VendorModel = VendorModel;
    this.getSamData = this.getSamData.bind(this);
    this.getVendorRecords = this.getVendorRecords.bind(this);
    this._response = {
      status: true,
      message: "Server error! Please try again later",
    };
  }

  async getSamData(query) {
    //code here
    return await this.SamModel.find(query);
  }

  async getVendorRecords(req) {
    // console.log(req.query)
    try {
      let body = req.query;
      let samsSearchQuery;
      let samsResult = [];
      const offset = req.query.offset;
      const limit = req.query.limit;
      let vendorName = {
        type: "LEGAL_BUSINESS_NAME",
        value: body.vendorName ? body.vendorName : "",
      };
      let dunsNumber = {
        type: "DUNS",
        value: body.dunsNumber ? body.dunsNumber : "",
      };
      let naicsCode = {
        type: "PRIMARY_NAICS",
        value: body.naicsCode ? body.naicsCode : "",
      };
      let naicsDescriptionKey = {
        type: "NAICS Description",
        value: "",
      };
      let keyArray = [vendorName, dunsNumber, naicsCode, naicsDescriptionKey];
      let samsQuery = new Array(); //for sams table
      keyArray.forEach((item, index) => {
        if (item.value != "") {
          if (item.type === "DUNS" && item.type != "") {
            samsQuery.push({ [`${item.type}`]: parseInt(item.value) });
          } else {
            samsQuery.push({
              [`${item.type}`]: new RegExp(
                ["^", item.value, "$"].join(""),
                "i"
              ),
            });
          }
        }
      });
      if (samsQuery.length) {
        samsSearchQuery = { $or: samsQuery };
        const documentCount = await this.SamModel.find(samsSearchQuery).countDocuments();
        samsResult = await this.SamModel.find(samsSearchQuery)
        .limit(parseInt(limit))
        .skip(parseInt(offset));
        let totalResult = samsResult;
          this._response = {
            status: true,
            data: totalResult,
            total: documentCount,
            page: Math.floor(parseInt(offset) / parseInt(limit)),
          };
          return requestHelper.respondWithJsonBody(200, this._response);
      }else {
        this._response = {
          status: true,
          data: [],
          total: 0,
          page: 0,
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

  async getVendorSuggestion(req) {
    // console.log(req.query.key)

    try {
      let result = await this.SamModel.find(
        { ["LEGAL_BUSINESS_NAME"]: new RegExp("^" + req.query.key) },
        { _id: true, ["LEGAL_BUSINESS_NAME"]: true }
      ).distinct('LEGAL_BUSINESS_NAME');
      console.log(result);
      if (result) {
        this._response = { status: true, data: result };
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
      this._response = { message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }
}

module.exports = SamService;
