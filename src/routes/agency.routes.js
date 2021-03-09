const router = require('express').Router()
const requestHelper = require('../common/request_helper');
const { agencyService } = require("../services/index")
    
    router.get('/all', async (req, res) => {
        const result = await agencyService.getAgencies()
        return requestHelper.handleResponse(res, result)
    })

module.exports = router