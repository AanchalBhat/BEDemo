const router = require('express').Router()
const { vendorService, samService } = require("../services/index")
const requestHelper = require('../common/request_helper');
const jwtMiddleWare = require('../middleware/jwt-auth')

router.get('/searchVendor', jwtMiddleWare, async (req, res) => {
    const result = await samService.getVendorRecords(req)    
    return requestHelper.handleResponse(res, result)
})

router.get('/getVendorName', jwtMiddleWare, async (req, res) => {
    const result = await samService.getVendorSuggestion(req)
    return requestHelper.handleResponse(res, result)
})

router.get('/getNAICSDescriptions', jwtMiddleWare, async (req, res) => {
    const result = await vendorService.getNaicsDescriptionSuggestion(req)
    return requestHelper.handleResponse(res, result)
})
router.get('/getNAICSDescriptionString', jwtMiddleWare, async (req, res)=>{
    const result = await vendorService.getNaicsDescription(req)
    return requestHelper.handleResponse(res, result)
})
module.exports = router