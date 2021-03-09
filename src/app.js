const express = require("express")
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.json())
app.use(cors())

app.use((error, req, res, next) => {
    console.log(req)
    console.error(error)
    res.status(error.statusCode || 500).json({message: error.message})
})

module.exports = app