const jwt = require("jsonwebtoken");
const Joi = require('joi');
//Create JWT
const createJWT = parsedBody => {
    return jwt.sign(JSON.stringify(parsedBody), process.env.SHARED_SECRET);
};

//Verify TOKEN
const verifyJWT = token => {
    return jwt.verify(token, process.env.SHARED_SECRET);;
}

const validate = function (body, schema) {
    return new Promise((resolve, reject) => {
        Joi.validate(body, schema, {
            abortEarly: false
        }, function (err, value) {

            if (err) {
                let errors = {}
                err.details.forEach(error =>{
                    const [key, value] = [error.context.key, error.message]
                    errors[key] = value
                })
                reject({ status_code: 400, message: errors });
            }
            else {
                resolve(value);
            }
        });
    });
}

const generateDigitCode = (count) => {
    let chars = '0123456789'.split('');
    let result = '';
    for(let i = 0; i < count; i++){
        let x = Math.floor(Math.random() * chars.length);
        result += chars[x];
    }
    return result;
};

module.exports = {
    verifyJWT,
    createJWT,
    validate,
    generateDigitCode,
};
