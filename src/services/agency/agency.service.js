const requestHelper = require('../../common/request_helper');
const Joi = require('joi');
const utils = require('../../common/utils');
class AgencyService {

    constructor(AgencyModel) {
        this.AgencyModel = AgencyModel
        this.getAgencies = this.getAgencies.bind(this)
        this._reponse = {status: true, message: "Server error! Please try again later" };
    }

    async getAgencies() {
        try {
          let result = await this.AgencyModel.find();
          if(result) {
            this._response = {status: true, data: result}; 
            return requestHelper.respondWithJsonBody(200, this._response);
          } else {
            this._response = {status: false, message: "No data found!", data: null}; 
            return requestHelper.respondWithJsonBody(200, this._response);
          }
        }
        catch(err) {
          this._response ={ message: err.message };
          if (err && err.status_code == 400) {
              return requestHelper.respondWithJsonBody(400, this._response,);
          }
          return requestHelper.respondWithJsonBody(500, this._response);
        }
      }
}
module.exports = AgencyService
