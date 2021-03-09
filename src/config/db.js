const mongoose = require('mongoose')

const fs  = require('fs')

module.exports = class DBManager {
    async connectToDatabase() {
        const caBundle = fs.readFileSync(__dirname +"/rds-combined-ca-bundle.pem", "utf8");
        const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
        // const uri = `mongodb://localhost:27017/mongo`;
        // const testUri = process.env.MONGO_URL  //localmongoURL
        const options = {
            ssl: true,
            sslCA: caBundle,
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
        mongoose.connect(uri, options)
            .then(client => {
                console.log("Connection Established !!", uri);
            }).catch((error) => {
                console.log('Database connection failed !!', error.message)
            });
    }
}
