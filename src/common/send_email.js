const AWS = require('aws-sdk')

const {
  accessKeyId,
  secretAccessKey,
  region,
  FROM_EMAIL,
  TO_EMAIL
} = process.env

AWS.config.update({
  region: region,
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
});
const SES = new AWS.SES({
  apiVersion: '2010-12-01'
})

const sendEmailWithHtmlBody = (to, from, subject, email) => {
  const params = {
    Destination: {
      ToAddresses: [to ? to : TO_EMAIL]
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: email
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: FROM_EMAIL, /* required */
    ReplyToAddresses: [
      FROM_EMAIL
    ],
  };

  // Create the promise and SES service object
  return SES.sendEmail(params).promise();
}

const sendEmailWithTextBody = (to, from, subject, email) => {
  const params = {
    Destination: {
      ToAddresses: [to ? to : TO_EMAIL]
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: email
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: FROM_EMAIL, /* required */
    ReplyToAddresses: [
      FROM_EMAIL
    ],
  };

  // Create the promise and SES service object
  return SES.sendEmail(params).promise();
}
module.exports = { sendEmailWithHtmlBody, sendEmailWithTextBody }