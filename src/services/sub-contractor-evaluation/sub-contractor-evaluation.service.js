
const requestHelper = require('../../common/request_helper');

const { ObjectId } = require('mongodb')

class SubContractorService {
    constructor(SubContractorEvaluationModel) {
        this.SubContractorEvaluationModel = SubContractorEvaluationModel
        this.getEvaluation = this.getEvaluation.bind(this)
        this.addEvaluation = this.addEvaluation.bind(this)
        this.updateEvaluation = this.updateEvaluation.bind(this)
        this._reponse = { success: false, message: "Server error! Please try again later" };

    }
    async getEvaluation(query) {
      //code here
      return await this.SubContractorEvaluationModel.find(query);
    }

    async addEvaluation(evaluation) {
      //code here
      const newEntry = new this.SubContractorEvaluationModel(evaluation)
      evaluation['status'] = 'Pending'
      await newEntry.save()
      return newEntry
    }

    async updateEvaluation(evaluation) {
      try {
        const id = evaluation._id
        delete evaluation['_id']
        evaluation['status'] = 'Completed'
        let doc = await this.SubContractorEvaluationModel.findOneAndUpdate(
          { _id: ObjectId(id)},
          evaluation
        )
        return { status: 200, response: "Record updated successfully!"}
      } catch (err) {
        console.log(err)
        return { status: 500, error: "Error Updating the Record", errorStack: err }
      }
    }
}

module.exports = SubContractorService