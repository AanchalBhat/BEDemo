const Joi = require('joi');
const md5 = require('md5');

const requestHelper = require('../../common/request_helper');
const { sign } = require('../../jwt/jwt-module')
const utils = require('../../common/utils');
const { sendEmailWithHtmlBody } = require('../../common/send_email')
const { sendSMS } = require("../../common/send_sms")
const { generateDigitCode } = require('../../common/utils');

const { BASE_URL, FROM_EMAIL } = process.env

class AuthService {
    constructor(UserModel, MFAModel) {
        this.UserModel = UserModel
        this.MFAModel = MFAModel
        this.signUp = this.signUp.bind(this)
        this.login = this.login.bind(this)
        this._response = {status: false, message: "Server error! Please try again later!!"};
    }
    /*Login*/
    async login(body) {
        try {
            const schema = Joi.object().keys({
                userId: Joi.string().required(),
                password: Joi.string().required()
            });
            await utils.validate(body, schema)
            let userId = body.userId
            let password = md5(body.password)
            this._response = { status: false, message: "Invalid username or password" };
            const user = await this.UserModel.findOne({userId})
            const isActive = user && user['isActive']
            if(user && isActive){
                if (user['password'] === password) {
                    let userData = {
                        _id: user._id,
                        id: user['userId'],
                        email: user['email'],
                        role: user['role']
                    };

                    let token = utils.createJWT(userData);
                    this._response = {status: true, message: "Login success", data: {
                            id: user['userId'],
                            email: user['email'],
                            phone: user['phone'],
                            role: user['role'],
                            token
                        } };
                    const code = generateDigitCode(6)
                    const mfa = await this.MFAModel.findOne({userId})
                    if (mfa) {
                        await this.MFAModel.updateOne({ userId }, { code, time: new Date().getTime() });
                    } else {
                        const new_mfa = new this.MFAModel({
                            userId,
                            code: code,
                            time: new Date().getTime(),
                        })
                        await new_mfa.save()
                    }
                    const mailBody = mfaVerificationCodeTemplate(code)
                    sendEmailWithHtmlBody(user['email'], FROM_EMAIL, 'MRT', mailBody)
                      .then(response => {
                          response.json
                      })
                      .catch(err => {
                          console.log(err)
                      })
                    return requestHelper.respondWithJsonBody(200, this._response);
                } else {
                    this._response = {status: false, message: "Username or password is incorrect", data: [] };
                }
            }
            else{
                if(!user){
                    this._response = {status: false, message: "Username or password is incorrect", data: [] };
                }else{
                this._response = {status: false, active:false, message: "User is not active", data: [] };
                }
            }
            return requestHelper.respondWithJsonBody(200, this._response);
        }catch(err){
            this._response.message = err.message;
            if (err && err.status_code == 400) {
                return requestHelper.respondWithJsonBody(400, this._response,);
            }
            return requestHelper.respondWithJsonBody(500, this._response);
        }
    }

    async verifyMFA(req) {
        try {
            let userId = req.user.id
            const user = await this.UserModel.findOne({userId})
            const mfa = await this.MFAModel.findOne({userId})
            this._response = { status: false, message: "The verification code is incorrect." };
            if (mfa.code === req.body.code) {
                let responseData = {
                    _id: user._id,
                    userId: user['userId'],
                    email: user['email'],
                    phone: user['phone'],
                    firstname: user['firstname'],
                    middlename: user['middlename'],
                    lastname: user['lastname'],
                    agency_code: user['agency_code'],
                    role: user['role'],
                    office_symbol: user['office_symbol'],
                    organization: user['organization']
                };
                this._response = {status: true, message: "MFA success", data: responseData};
                return requestHelper.respondWithJsonBody(200, this._response);
            } else {
                return requestHelper.respondWithJsonBody(200, this._response);
            }
        } catch (err) {
            this._response.message = err.message;
            if (err && err.status_code == 400) {
                return requestHelper.respondWithJsonBody(400, this._response,);
            }
            return requestHelper.respondWithJsonBody(500, this._response);
        }
    }

    async sendMFACode(req) {
        try {
            let userId = req.user.id
            let body = req.body
            const { type } = body
            const user = await this.UserModel.findOne({userId})
            this._response = { status: false, message: "The verification code is incorrect." };
            const code = generateDigitCode(6)
            const mfa = await this.MFAModel.findOne({userId})
            if (mfa) {
                await this.MFAModel.updateOne({ userId }, { code, time: new Date().getTime() });
            } else {
                const new_mfa = new this.MFAModel({
                    userId,
                    code: code,
                    time: new Date().getTime(),
                })
                await new_mfa.save()
            }
            const mailBody = mfaVerificationCodeTemplate(code)
            this._response = {status: true, message: "sending code success"};
            if (type === 'email') {
                sendEmailWithHtmlBody(user['email'], FROM_EMAIL, 'MRT', mailBody)
                  .then(response => {
                      response.json
                  })
                  .catch(err => {
                      console.log(err)
                  })
                return requestHelper.respondWithJsonBody(200, this._response);
            } else { //sms
                console.log({code, phone: user['phone']})
                const body = `${code} is your MRT verification code.`
                await sendSMS({ to: user['phone'], body });
                return requestHelper.respondWithJsonBody(200, this._response);
            }
        } catch (err) {
            this._response.message = err.message;
            if (err && err.status_code == 400) {
                return requestHelper.respondWithJsonBody(400, this._response,);
            }
            return requestHelper.respondWithJsonBody(500, this._response);
        }
    }

    /*signup*/
    async signUp(body) {
        try {
            const user = new this.UserModel({
                email: body.email,
                userId: body.userId,
                agency_code: body.agency_code,
                phone: '+'+body.phone,
                organization: body.organization,
                office_symbol: body.office_symbol,
                firstname: body.firstname,
                middlename: body.middlename,
                lastname: body.lastname,
                role: body.role,
                password: md5(body.password)
            })
            const userExist = await this.UserModel.findOne({userId: user.userId}) || await this.UserModel.findOne({email: user.email})
            if(userExist){
                this._response = {status: false, message: "User already exist"};
                return requestHelper.respondWithJsonBody(200, this._response);
            }else{
                await user.save()
                this._response = {status: true, message: "Registered Successfully"};
                return requestHelper.respondWithJsonBody(200, this._response);
            }
        } catch(err) {
            this._response ={ status: false, message: err.message };
            if (err && err.status_code == 400) {
                return requestHelper.respondWithJsonBody(400, this._response,);
            }
            return requestHelper.respondWithJsonBody(500, this._response);
        }
    }

    async forgotPassword(body) {
        try {
            const schema = Joi.object().keys({
                value: Joi.string().required(),
                query: Joi.string().required()
            });
            await utils.validate(body, schema)
            if(body.query === 'password') {
                const userExists = await this.UserModel.findOne({userId: body.value}) || await this.UserModel.findOne({email: body.value});
                if(userExists != null ){
                    let userData = {
                        _id: userExists._id,
                        id: userExists['userId'],
                        email: userExists['email'],
                        role: userExists['role']
                    };
                    let token = utils.createJWT(userData);
                    let emailBody = resetEmailTemplate(FROM_EMAIL, `${BASE_URL}/reset/${token}`)
                    sendEmailWithHtmlBody(userData.email, FROM_EMAIL, 'Reset Password Link', emailBody)
                        .then(response => {
                            response.json
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    this._response = {status: true, message: "Reset link sent to email." };
                    return requestHelper.respondWithJsonBody(200, this._response);
                }else {
                    this._response = { status: false, message: "Please enter a valid username or email." };
                    return requestHelper.respondWithJsonBody(200, this._response);
                }
            }
            else {
                const user = await this.UserModel.findOne({email: body.value});
                if(user != null) {

                    let username = user['userId'];
                    let emailBody = userIdRecoveryTemlate(FROM_EMAIL, username);
                    sendEmailWithHtmlBody(body.value, FROM_EMAIL, 'UserName Recovery', emailBody)
                        .then(response => {
                            response.json
                        })
                        .catch(err => {
                            console.log(err)
                        })
                    this._response = {status: true, message: "Username sent to email." };
                    return requestHelper.respondWithJsonBody(200, this._response);
                }
                else {
                    this._response = { status: false, message: "Please enter a registered email." };
                    return requestHelper.respondWithJsonBody(200, this._response);
                }

            }

            return requestHelper.respondWithJsonBody(200, this._response);
        }
        catch(err) {
            this._response ={ status: false, message: err.message };
            if (err && err.status_code == 400) {
                return requestHelper.respondWithJsonBody(400, this._response,);
            }
            return requestHelper.respondWithJsonBody(500, this._response);
        }
    }

    async resetPassword(body) {
        try{
            const schema = Joi.object().keys({
                new_password: Joi.string().required(),
                token: Joi.string().required()
            });
            await utils.validate(body, schema)
            let new_password = body.new_password;
            let verifiedUser = utils.verifyJWT(body.token);
            this._response = { status: false, message: "Invalid Session Expired" };
            const user = await this.UserModel.findOne({userId: verifiedUser.id});
            if(user) {
                let result = await this.UserModel.updateOne({userId: verifiedUser.id}, {password: md5(new_password)});
                if(result) {
                    this._response = {status: true, message:"updated successfully", data: result};
                    return requestHelper.respondWithJsonBody(200, this._response);
                } else {
                    this._response = {status: true, message: "error while updating", data: null};
                    return requestHelper.respondWithJsonBody(200, this._response);
                }
            }
        }
        catch(err) {
            this._response ={ status: false, message: err.message };
            if (err && err.status_code == 400) {
                return requestHelper.respondWithJsonBody(400, this._response,);
            }
            return requestHelper.respondWithJsonBody(500, this._response);
        }

    }

}
module.exports = AuthService



// Email Templates
const resetEmailTemplate = (from, resetUrl) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head>
<!--[if gte mso 9]><xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml><![endif]-->
<title>Sub Contractor Letter</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0 ">
<meta name="format-detection" content="telephone=no">
<!--[if !mso]><!-->
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800" rel="stylesheet">
<!--<![endif]-->
<style type="text/css">
body {
    margin: 0 !important;
    padding: 0 !important;
    -webkit-text-size-adjust: 100% !important;
    -ms-text-size-adjust: 100% !important;
    -webkit-font-smoothing: antialiased !important;
}
img {
    border: 0 !important;
    outline: none !important;
}
p {
    Margin: 0px !important;
    Padding: 0px !important;
}
table {
    border-collapse: collapse;
    mso-table-lspace: 0px;
    mso-table-rspace: 0px;
}
td, a, span {
    border-collapse: collapse;
    mso-line-height-rule: exactly;
}
.ExternalClass * {
    line-height: 100%;
}
.em_defaultlink a {
    color: inherit !important;
    text-decoration: none !important;
}
span.MsoHyperlink {
    mso-style-priority: 99;
    color: inherit;
}
span.MsoHyperlinkFollowed {
    mso-style-priority: 99;
    color: inherit;
}
 @media only screen and (min-width:481px) and (max-width:699px) {
.em_main_table {
    width: 100% !important;
}
.em_wrapper {
    width: 100% !important;
}
.em_hide {
    display: none !important;
}
.em_img {
    width: 100% !important;
    height: auto !important;
}
.em_h20 {
    height: 20px !important;
}
.em_padd {
    padding: 20px 10px !important;
}
}
@media screen and (max-width: 480px) {
.em_main_table {
    width: 100% !important;
}
.em_wrapper {
    width: 100% !important;
}
.em_hide {
    display: none !important;
}
.em_img {
    width: 100% !important;
    height: auto !important;
}
.em_h20 {
    height: 20px !important;
}
.em_padd {
    padding: 20px 10px !important;
}
.em_text1 {
    font-size: 16px !important;
    line-height: 24px !important;
}
u + .em_body .em_full_wrap {
    width: 100% !important;
    width: 100vw !important;
}
}
</style>
</head>
 
<body class="em_body" style="margin:0px; padding:0px;" bgcolor="#efefef">
<table class="em_full_wrap" valign="top" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#efefef" align="center">
  <tbody>
    <tr >
        <td style="text-align: left;padding: 20px">
            From: ${from}
        </td>
        <td style="text-align: right;padding: 20px">
            Date: ${new Date().toLocaleDateString()}
        </td>
    </tr>
    <tr>
        <td colspan="2" style="padding: 0 20px; text-align: justify">
        Please click on the below link to reset your password.<br /><br>
        <a href="${resetUrl}">Reset Password</a><br />
        <br />
        </td>
    </tr>
  </tbody>
</table>
<div class="em_hide" style="white-space: nowrap; display: none; font-size:0px; line-height:0px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
</body></html>
`

const userIdRecoveryTemlate = (from, userId) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head>
<!--[if gte mso 9]><xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml><![endif]-->
<title>Sub Contractor Letter</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0 ">
<meta name="format-detection" content="telephone=no">
<!--[if !mso]><!-->
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800" rel="stylesheet">
<!--<![endif]-->
<style type="text/css">
body {
    margin: 0 !important;
    padding: 0 !important;
    -webkit-text-size-adjust: 100% !important;
    -ms-text-size-adjust: 100% !important;
    -webkit-font-smoothing: antialiased !important;
}
img {
    border: 0 !important;
    outline: none !important;
}
p {
    Margin: 0px !important;
    Padding: 0px !important;
}
table {
    border-collapse: collapse;
    mso-table-lspace: 0px;
    mso-table-rspace: 0px;
}
td, a, span {
    border-collapse: collapse;
    mso-line-height-rule: exactly;
}
.ExternalClass * {
    line-height: 100%;
}
.em_defaultlink a {
    color: inherit !important;
    text-decoration: none !important;
}
span.MsoHyperlink {
    mso-style-priority: 99;
    color: inherit;
}
span.MsoHyperlinkFollowed {
    mso-style-priority: 99;
    color: inherit;
}
 @media only screen and (min-width:481px) and (max-width:699px) {
.em_main_table {
    width: 100% !important;
}
.em_wrapper {
    width: 100% !important;
}
.em_hide {
    display: none !important;
}
.em_img {
    width: 100% !important;
    height: auto !important;
}
.em_h20 {
    height: 20px !important;
}
.em_padd {
    padding: 20px 10px !important;
}
}
@media screen and (max-width: 480px) {
.em_main_table {
    width: 100% !important;
}
.em_wrapper {
    width: 100% !important;
}
.em_hide {
    display: none !important;
}
.em_img {
    width: 100% !important;
    height: auto !important;
}
.em_h20 {
    height: 20px !important;
}
.em_padd {
    padding: 20px 10px !important;
}
.em_text1 {
    font-size: 16px !important;
    line-height: 24px !important;
}
u + .em_body .em_full_wrap {
    width: 100% !important;
    width: 100vw !important;
}
}
</style>
</head>
 
<body class="em_body" style="margin:0px; padding:0px;" bgcolor="#efefef">
<table class="em_full_wrap" valign="top" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#efefef" align="center">
  <tbody>
    <tr >
        <td style="text-align: left;padding: 20px">
            From: ${from}
        </td>
        <td style="text-align: right;padding: 20px">
            Date: ${new Date().toLocaleDateString()}
        </td>
    </tr>
    <tr>
        <td colspan="2" style="padding: 0 20px; text-align: justify">
            The username for the registered email is: <b> ${userId} </b>. 
            <br /><br />
            Please try to login again <a href="${process.env.BASE_URL}"> here</a>
        </td>
    </tr>
  </tbody>
</table>
<div class="em_hide" style="white-space: nowrap; display: none; font-size:0px; line-height:0px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
</body></html>
`

const mfaVerificationCodeTemplate = (code) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head>
<!--[if gte mso 9]><xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml><![endif]-->
<title>Sub Contractor Letter</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0 ">
<meta name="format-detection" content="telephone=no">
<!--[if !mso]><!-->
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800" rel="stylesheet">
<!--<![endif]-->
<style type="text/css">
body {
    margin: 0 !important;
    padding: 0 !important;
    -webkit-text-size-adjust: 100% !important;
    -ms-text-size-adjust: 100% !important;
    -webkit-font-smoothing: antialiased !important;
}
img {
    border: 0 !important;
    outline: none !important;
}
p {
    Margin: 0px !important;
    Padding: 0px !important;
}
table {
    border-collapse: collapse;
    mso-table-lspace: 0px;
    mso-table-rspace: 0px;
}
td, a, span {
    border-collapse: collapse;
    mso-line-height-rule: exactly;
}
.ExternalClass * {
    line-height: 100%;
}
.em_defaultlink a {
    color: inherit !important;
    text-decoration: none !important;
}
span.MsoHyperlink {
    mso-style-priority: 99;
    color: inherit;
}
span.MsoHyperlinkFollowed {
    mso-style-priority: 99;
    color: inherit;
}
 @media only screen and (min-width:481px) and (max-width:699px) {
.em_main_table {
    width: 100% !important;
}
.em_wrapper {
    width: 100% !important;
}
.em_hide {
    display: none !important;
}
.em_img {
    width: 100% !important;
    height: auto !important;
}
.em_h20 {
    height: 20px !important;
}
.em_padd {
    padding: 20px 10px !important;
}
}
@media screen and (max-width: 480px) {
.em_main_table {
    width: 100% !important;
}
.em_wrapper {
    width: 100% !important;
}
.em_hide {
    display: none !important;
}
.em_img {
    width: 100% !important;
    height: auto !important;
}
.em_h20 {
    height: 20px !important;
}
.em_padd {
    padding: 20px 10px !important;
}
.em_text1 {
    font-size: 16px !important;
    line-height: 24px !important;
}
u + .em_body .em_full_wrap {
    width: 100% !important;
    width: 100vw !important;
}
}
</style>
</head>
 
<body class="em_body" style="margin:0px; padding:0px;" bgcolor="#efefef">
<table class="em_full_wrap" valign="top" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#efefef" align="center">
  <tbody>
    <tr >
        <td style="text-align: left;padding: 20px">
            ${code}  is your MRT verification code.
        </td>
        <td style="text-align: right;padding: 20px">
            ${new Date().toLocaleDateString()}
        </td>
    </tr>
  </tbody>
</table>
<div class="em_hide" style="white-space: nowrap; display: none; font-size:0px; line-height:0px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
</body></html>
`