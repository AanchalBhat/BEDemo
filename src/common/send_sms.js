const AWS = require('aws-sdk');

const { region, accessKeyId, secretAccessKey } = process.env

AWS.config.update({
  region,
  accessKeyId,
  secretAccessKey
});

const sendSMS = ({ to, body }) => {
  const params = {
    Message: body, /* required */
    PhoneNumber: to, //+14693052133
  };
  // Create promise and SNS service object
  const publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

// Handle promise's fulfilled/rejected states
  return publishTextPromise.then(
    function(data) {
      console.log("MessageID is " + data.MessageId);
    }).catch(
    function(err) {
      console.error(err, err.stack);
    });
}

module.exports = { sendSMS }
