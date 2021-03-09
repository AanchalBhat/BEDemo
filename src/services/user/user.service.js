const requestHelper = require("../../common/request_helper");
const Joi = require("joi");
const utils = require("../../common/utils");
const { sendEmailWithHtmlBody } = require("../../common/send_email");
const ReverseMd5 = require("reverse-md5");
const md5 = require('md5');

const reverseMd5 = ReverseMd5({
  lettersUpper: false,
  lettersLower: true,
  numbers: true,
  special: false,
  whitespace: true,
  maxLen: 12,
});
class UserService {
  constructor(UserModel) {
    this.UserModel = UserModel;
    this.getProfile = this.getProfile.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.searchUser = this.searchUser.bind(this);
    this.queryUsers = this.queryUsers.bind(this);
    this._reponse = {
      status: true,
      message: "Server error! Please try again later",
    };
  }

  /*Create user account*/

  async createUser(req) {
    const body = req.body;
    try {
      const user = new this.UserModel({
        email: body.email,
        agency_code: body.agency_code,
        phone: "+" + body.phone,
        organization: body.organization,
        office_symbol: body.office_symbol,
        firstname: body.firstname,
        middlename: body.middlename,
        lastname: body.lastname,
        role: body.role,
        isActive: false,
      });
      const userExist = await this.UserModel.findOne({ email: user.email });
      if (userExist) {
        this._response = {
          status: false,
          message: "User with same email already exist",
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      } else {
        const res = await user.save();
        this._response = { status: true, message: "Registered Successfully" };
        const url = (process.env.domain || "https://dev.themarket-intel.com") +  "/active/" + res._id;
        const mailBody = userAccountEmailTemplate(url);
        sendEmailWithHtmlBody(body.email, '', 'MRT', mailBody)
          .then(response => {
            response.json
          })
          .catch(err => {
            console.log(err)
          })
        return requestHelper.respondWithJsonBody(200, this._response);
      }
    } catch (err) {
      this._response = { status: false, message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }

  /*Check link to activate user Account */
  async CheckActiveAccountLink(req) {
    try {
      const _id = req.params.id;
      const user = await this.UserModel.findById(_id)
      this._response = {
        status: true,
        message: "This link is available"
      };
      console.log({ user })
      if (!user) { // Check user is existing -> link with id is valid
        this._response = {
          status: false,
          code: 1,
          message: "This link is not validate. Please contact system admin to activate your account."
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
      if (user && user.isActive) { // Check user has already activated account
        this._response = {
          status: false,
          code: 2,
          message: "You have already activated the account"
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
      return requestHelper.respondWithJsonBody(200, this._response);
    } catch (err) {
      this._response = { message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }

  /*activate user Account */
  async activeAccount(req) {
    try {
      const _id = req.params.id;
      const userId = req.body.userId;
      const email = req.body.email;
      const password = md5(req.body.password);
      const user = await this.UserModel.findById(_id)
      console.log({ user })
      if (!user) { // Check user is existing -> link with id is valid
        this._response = {
          status: false,
          message: "This link is not available."
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
      if (user && user.isActive) { // Check user has already activated account
        this._response = {
          status: false,
          message: "You have already activated the account"
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
      if (user && user.email !== email) { // Check if email is same
        this._response = {
          status: false,
          errorField: 'email',
          message: "The email is not validated."
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
      const _user = await this.UserModel.findOne({ userId })
      console.log({ _user })
      if (_user) {
        this._response = {
          status: false,
          errorField: 'userId',
          message: "This userId has been already used for another user."
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
      const body = {
        userId,
        password,
        isActive: true,
      };
      let result = await this.UserModel.updateOne({ _id }, { $set: body });
      if (result) {
        this._response = {
          status: true,
          message: "You have activated the account successfully",
          data: result,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      } else {
        this._response = {
          status: true,
          message: "error while updating",
          data: null,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
    } catch (err) {
      this._response = { message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }

  /*Get user profile */
  async getProfile(req) {
    try {
      let result = await this.UserModel.findById(req.user._id);
      if (result) {
        const user = {
          userId: result.userId,
          email: result.email,
          organization: result.organization,
          agency_code: result.agency_code,
          phone: result.phone,
          office_symbol: result.office_symbol,
          firstname: result.firstname,
          middlename: result.middlename,
          lastname: result.lastname,
          role: result.role,
        };
        this._response = { status: true, data: user };
        return requestHelper.respondWithJsonBody(200, this._response);
      } else {
        this._response = {
          status: false,
          message: "No data found!",
          data: null,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
    } catch (err) {
      this._response = { message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }

  /*Update user profile */
  async updateProfile(req) {
    try {
      let id = req.user._id;
      let body = req.body;
      const schema = Joi.object().keys({
        phone: Joi.string().allow(""),
        firstname: Joi.string().allow(""),
        middlename: Joi.string().allow(""),
        lastname: Joi.string().allow(""),
      });
      await utils.validate(body, schema);
      body.phone = "+" + body.phone;
      let result = await this.UserModel.updateOne({ _id: id }, { $set: body });
      if (result) {
        this._response = {
          status: true,
          message: "updated successfully",
          data: result,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      } else {
        this._response = {
          status: true,
          message: "error while updating",
          data: null,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
    } catch (err) {
      this._response = { message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }

  //get all users reccord
  async getAllUsersNew(req) {
    console.log(req.query);
    try {
      const offset = req.query.offset ? parseInt(req.query.offset) : 20;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      // let body = req.body;
      let body = req.query;
      console.log("data", body.agency_code);
      let totalResult = await this.UserModel.count({
        agency_code: body.agency_code,
        isDeleted: false,
      });
      let filteredUsers = await this.UserModel.find({
        agency_code: body.agency_code,
        isDeleted: false,
      })
        .skip((page - 1) * offset)
        .limit(offset);
      if (filteredUsers) {
        this._response = {
          status: true,
          total: totalResult,
          data: filteredUsers,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      } else {
        this._response = {
          status: false,
          message: "No data found!",
          data: null,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
    } catch (err) {
      this._response = { message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }
  //search user  by email, userId, firstname, lastname, role
  async searchUser(req) {
    try {
      const offset = req.query.offset ? parseInt(req.query.offset) : 20;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      let body = req.query;
      const search = req.query.q || "";
      const regex = new RegExp(`^${search}`);
      let total = await this.UserModel.find({
        isDeleted: false,
        agency_code: body.agency_code,
        $or: [
          { email: regex },
          { userId: regex },
          { organization: regex },
          { firstname: regex },
          { lastname: regex },
          { role: regex },
        ],
      }).countDocuments();
      let filteredUsers = await this.UserModel.find({
        $or: [
          { email: regex },
          { userId: regex },
          { firstname: regex },
          { lastname: regex },
          { role: regex },
        ],
        userId: { $ne: req.user.id },
        agency_code: body.agency_code,
        isDeleted: false,
      })
        .skip((page - 1) * offset)
        .limit(offset);
      if (filteredUsers) {
        this._response = { status: true, total, page, data: filteredUsers };
        return requestHelper.respondWithJsonBody(200, this._response);
      } else {
        this._response = {
          status: false,
          message: "No data found!",
          data: null,
        };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
    } catch (err) {
      this._response = { message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }

  async disableUser(req) {
    console.log(req);
    try {
      if (req.user.role === "System Admin") {
        let body = req.body;
        const schema = Joi.object().keys({
          userId: Joi.string().required(),
          isActive: Joi.bool().required(),
        });
        await utils.validate(body, schema);
        let result = await this.UserModel.update(
          { userId: body.userId },
          { isActive: body.isActive }
        );
        if (result) {
          this._response = {
            status: true,
            message: "disabled successfully",
            data: result,
          };
          return requestHelper.respondWithJsonBody(200, this._response);
        } else {
          this._response = {
            status: true,
            message: "error while disabling",
            data: null,
          };
          return requestHelper.respondWithJsonBody(200, this._response);
        }
      } else {
        this._response = { status: true, message: "Unauthorized to Disable!!" };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
    } catch (err) {
      this._response = { message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }

  async deleteUser(req) {

    try {
      if (req.user.role === "System Admin") {
        let body = req.body;
        const schema = Joi.object().keys({
          _id: Joi.string().required(),
        });

        await utils.validate(body, schema);
        console.log(body)
        let result = await this.UserModel.updateOne(
          { _id: body._id },
          { isDeleted: true }
        );
        if (result) {
          this._response = {
            status: true,
            message: "deleted successfully",
            data: result,
          };
          return requestHelper.respondWithJsonBody(200, this._response);
        } else {
          this._response = {
            status: true,
            message: "error while deleting",
            data: null,
          };
          return requestHelper.respondWithJsonBody(200, this._response);
        }
      } else {
        this._response = { status: true, message: "Unauthorized to Delete!!" };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
    } catch (err) {
      this._response = { message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }

  async updateUser(req) {
    try {
      if (req.user.role.includes("System Admin")) {
        let body = req.body;
        const schema = Joi.object().keys({
          _id:Joi.string().required(),
          // userId: Joi.string().required(),
          email: Joi.string().allow(""),
          agency_code: Joi.string().allow(""),
          phone: Joi.string().allow(""),
          office_symbol: Joi.string().allow(""),
          firstname: Joi.string().allow(""),
          middlename: Joi.string().allow(""),
          lastname: Joi.string().allow(""),
          organization: Joi.string().allow(""),
          role: Joi.string().allow(""),
        });
        await utils.validate(body, schema);
        if (body.phone) {
          let phne = body.phone.replace(/\+/g, "");
          let phnNo = "+" + phne;
          body.phone = phnNo;
        }
        let result = await this.UserModel.updateOne(
          { _id: body._id },
          { $set: body }
        );
        if (result) {
          this._response = {
            status: true,
            message: "updated successfully",
            data: result,
          };
          return requestHelper.respondWithJsonBody(200, this._response);
        } else {
          this._response = {
            status: true,
            message: "error while updating",
            data: null,
          };
          return requestHelper.respondWithJsonBody(200, this._response);
        }
      } else {
        this._response = { status: false, message: "You are not allowed to change user information." };
        return requestHelper.respondWithJsonBody(200, this._response);
      }
    } catch (err) {
      this._response = { message: err.message };
      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  }

  // get user on query
  async queryUsers(req) {
    const users = await this.UserModel.find(req.query, {
      userId: 1,
      office_symbol: 1,
      phone: 1,
    });
    this._response = {
      status: true,
      users,
    };
    return requestHelper.respondWithJsonBody(200, this._response);
  }
}
module.exports = UserService;

// Email templates
const userAccountEmailTemplate = (activeUrl) =>
  `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head>
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
        <td colspan="2" style="padding: 20px; text-align: justify">
            Please click on the below link to active your account<br /><br>
            <a href="${activeUrl}">Activate your account</a><br />
            <br />
        </td>
    </tr>
  </tbody>
</table>
<div class="em_hide" style="white-space: nowrap; display: none; font-size:0px; line-height:0px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
</body></html>
`;
