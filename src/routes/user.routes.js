const router = require('express').Router()
const { userService } = require("../services/index")
const requestHelper = require('../common/request_helper');
const jwtMiddleWare = require('../middleware/jwt-auth')

    // create user account by system admin
    router.post('/create', jwtMiddleWare, async (req, res) => {
        const result = await userService.createUser(req)
        return requestHelper.handleResponse(res, result)
    })

    // activate user account
    router.get('/active/:id', async (req, res) => {
        const result = await userService.CheckActiveAccountLink(req)
        return requestHelper.handleResponse(res, result)
    })

    // check link to activate account
    router.post('/active/:id', async (req, res) => {
        const result = await userService.activeAccount(req)
        return requestHelper.handleResponse(res, result)
    })
    // get profile
    router.get('/profile', jwtMiddleWare, async (req, res) => {
        const result = await userService.getProfile(req)
        return requestHelper.handleResponse(res, result)
    })

    //update profile
    router.post('/profile/update', jwtMiddleWare, async (req, res) => {
        const result = await userService.updateProfile(req)
        return requestHelper.handleResponse(res, result)
    })

    router.get('/getAll', async (req, res)=>{
        const result = await userService.getAllUsersNew(req)
        return requestHelper.handleResponse(res, result)
    })

    router.get('/search', jwtMiddleWare, async (req, res)=>{
        const result = await userService.searchUser(req)
        return requestHelper.handleResponse(res, result)
    })

    router.post('/disable', jwtMiddleWare, async (req, res)=>{
        const result = await userService.disableUser(req)
        return requestHelper.handleResponse(res, result)
    })

    router.post('/delete', jwtMiddleWare, async (req, res)=>{
        const result = await userService.deleteUser(req)
        return requestHelper.handleResponse(res, result)
    })

    router.post('/update', jwtMiddleWare, async (req, res)=>{
        const result = await userService.updateUser(req)
        return requestHelper.handleResponse(res, result)
    })


module.exports = router
