const router = require('express').Router()
const requestHelper = require('../common/request_helper');
const { authService } = require("../services/index")
const jwtMiddleWare = require('../middleware/jwt-auth')

    //login
    router.post('/login', async (req, res) => {
        const body = req.body
        const result = await authService.login(body)
        return requestHelper.handleResponse(res, result)
    })

    //signup
    router.post('/signup', async (req, res) => {
        const body = req.body
        const result = await authService.signUp(body)
        return requestHelper.handleResponse(res, result)        
    })

    // forgotPassword
    router.post('/forgot', async (req, res) => {
        const body = req.body
        const result = await authService.forgotPassword(body)
        return requestHelper.handleResponse(res, result)
    })

    // resetPassword
    router.post('/reset-password', async (req, res) => {
        const body = req.body
        const result = await authService.resetPassword(body)
        return requestHelper.handleResponse(res, result)
    })

    // check jwt token
    router.get('/verify-token', jwtMiddleWare, async (req, res) => {
        res.json({code: 200})
    })

    //verifyMFA
    router.post('/verifyMFA', jwtMiddleWare, async (req, res) => {
        const result = await authService.verifyMFA(req)
        return requestHelper.handleResponse(res, result)
    })

    //send verifyMFACode
    router.post('/sendMFACode', jwtMiddleWare, async (req, res) => {
        const result = await authService.sendMFACode(req)
        return requestHelper.handleResponse(res, result)
    })
module.exports = router