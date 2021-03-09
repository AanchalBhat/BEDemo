const requestHelper = require("../../common/request_helper");
const Joi = require("joi");
const utils = require("../../common/utils");

class VendorService {
  constructor(VendorModel) {
    this.VendorModel = VendorModel;
    this.getNaicsDetails = this.getNaicsDetails.bind(this);
    this._response = {
      status: true,
      message: "Server error! Please try again later",
    };
  }

  async getNaicsDetails(req) {
    let query = {};
    if (req.query.code) {
      query["NAICS Code"] = new RegExp(`^${req.query.code}`, "i");
    }
    if (req.query.description) {
      query["NAICS Description"] = new RegExp(`^${req.query.description}`, "i");
    }
    const details = await this.VendorModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            code: "$NAICS Code",
            description: "$NAICS Description",
          },
        },
      },
    ]);
    this._response = {
      status: true,
      data: details,
    };
    return requestHelper.respondWithJsonBody(200, this._response);
  }

  async getNaicsDescriptionSuggestion(req) {
    try {
      let query = {};
      let dataArray = new Array();
      if (req.query.key) {
        query["NAICS Description"] = new RegExp(`^${req.query.key}`, "i");
      }
      const details = await this.VendorModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              NAICS_CODE: "$NAICS Code",
              NAICS_DESCRIPTION: "$NAICS Description",
            },
          },
        },
      ]);
      details.forEach((item, index) => {
        dataArray.push(item["_id"]);
      });
      this._response = {
        status: true,
        data: dataArray,
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

  async getNaicsDescription(req) {
    try {
      if (req.query.key) {
        let response = await this.VendorModel.findOne({
          "NAICS Code": new RegExp(`^${req.query.key}`, "i"),
        });
        this._response = {
          status: true,
          data: response,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }

      this._response = {
        status: true,
        data: [],
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
}

module.exports = VendorService;
