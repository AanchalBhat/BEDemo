const dotenv = require('dotenv')
dotenv.config()

const app  = require("./src/app")
const DBM = require("./src/config/db")
const apiRoutes = require('./src/routes')

const port = 8001

const DBManager = new DBM()
DBManager.connectToDatabase()
app.use('/api/v1', apiRoutes)
app.listen(process.env.PORT || port, (err, success) => {
    if (err) return console.log(err)
    console.log(`Connected to Port ${process.env.PORT || port}`)
})


process.on("unhandledRejection", error => {
    console.log(error.message)
    console.log("-----------------------------------")
    process.exit(1)
})