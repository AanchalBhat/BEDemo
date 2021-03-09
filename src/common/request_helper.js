'use strict';

exports.respondWithJsonBody = function (code, response) {
    return {
        statusCode: code,
        response
    };
};

exports.handleResponse = function (res, result) {
    const status = result.statusCode
    const response = result.response
    return res.status(status).json(response)
}

