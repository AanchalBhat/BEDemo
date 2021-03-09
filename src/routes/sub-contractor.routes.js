const router = require('express').Router()

const { BASE_URL, FROM_EMAIL } = process.env

const { sendEmailWithHtmlBody } = require('./../common/send_email')

const { subContractorEvaluationService, samService } = require('./../services/index')

router
    .get('/', async (req, res) => {
        const list = await subContractorEvaluationService.getEvaluation(req.query)
        res.json(list)
    })

    .post('/', async (req, res) => {
        const retValue = await subContractorEvaluationService.addEvaluation(req.body)
        const samEntry = await samService.getSamData({ DUNS: parseInt(retValue.sc_duns_no) })
        const email = emailTemplate(retValue.poc, `${BASE_URL}/form/${retValue._id}`, retValue.eval_signature, retValue.eval_name)
        if (samEntry.length > 0 && samEntry[0].GOVT_BUS_POC_EMAIL !== '') {
            sendEmailWithHtmlBody(FROM_EMAIL, samEntry[0].GOVT_BUS_POC_EMAIL, 'SubContractor Letter', email)
                .then(response => {
                    res.json({
                        subEmail: true,
                        data: 'Your evaluation has been successfully saved.'
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.json({
                        subEmail: true,
                        error: 'An error occured while sending the Email.'
                    })
                })
        } else {
            res.json({
                subEmail: false,
                email
            })
        }
    })

    .put('/', async (req, res) => {
        try {
            const retValue = await subContractorEvaluationService.updateEvaluation(req.body)
            res.json({ data: 'Your response has been successfully recorded!'})
        } catch(err) {
            res.json({ error: 'Error while updating the document'})
        }
    })

    .post('/send-email', async (req, res) => {
        sendEmailWithHtmlBody(FROM_EMAIL, req.body.to_email, 'SubContractor Letter', req.body.email)
            .then(response => {
                res.json({
                    data: 'SubContractor has been notified about your evalutaions.'
                })
            })
            .catch(err => {
                console.log(err)
                res.json({
                    error: 'An error occured while sending the Email.'
                })
            })
    })

    .get('/autocomplete-list', async (req, res) => {

        let queryList = []
        for ( let [key, value] of Object.entries(req.query)) {
            queryList.push({[key]: new RegExp(`${value}`, 'i')})
        }
        let aList = null
        if (req.query.hasOwnProperty('DUNS')) {
            let dunsNo = req.query.DUNS
            let dunsNoP = (parseInt(dunsNo) + 1).toString()
            while(dunsNo.length !== 9 && dunsNo.length < 9) {
                dunsNo += '0'
            }
            while(dunsNoP.length !== 9 && dunsNoP.length < 9) {
                dunsNoP += '0'
            }
            aList = await samService.getSamData({ 'DUNS': { $gt: parseInt(dunsNo), $lt: parseInt(dunsNoP) }} )
        } else {
            aList = await samService.getSamData({ $or: queryList})
        }
        res.json(aList.map(l => ({ 
            duns_no: l.DUNS.toString(), 
            duns_name: `${l.LEGAL_BUSINESS_NAME}`,
            phone: l.GOVT_BUS_POC_US_PHONE,
            addr: `${l.PHYSICAL_ADDRESS_LINE_1}, 
${l.PHYSICAL_ADDRESS_LINE_2}, 
${l.PHYSICAL_ADDRESS_CITY}, ${l.PHYSICAL_ADDRESS_PROVINCE_OR_STATE}, ${l.PHYSICAL_ADDRESS_COUNTRY_CODE}
${l.PHYSICAL_ADDRESS_ZIP_POSTAL_CODE}`,
            agency: l.LEGAL_BUSINESS_NAME
        })))

    })

module.exports = router




// Email Templates
const emailTemplate = (poc, url, img, eval_name) => `
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
            From: ${poc}
        </td>
        <td style="text-align: right;padding: 20px">
            Date: ${new Date().toLocaleDateString()}
        </td>
    </tr>
    <tr>
        <td colspan="2" style="padding: 0 20px; text-align: justify">
            <strong>Subcontractor letter</strong><br/></br>
I have completed your company's subcontractor evaluation report, you will have ten business days to concur or non-concur with our prime contractor evaluation for the services/products your company has rendered on this effort. Please click on the link below to go directly to the report.<br /><br .>
<a href="${url}">${url}</a><br />
<br />
At the conclusion of the report click on the save button to lock in your response.<br /><br />
Sincerely,<br />
<img  class="em_img" alt="${eval_name}" style="display:block; font-family:Arial, sans-serif; font-size:15px; line-height:34px; color:#000000; max-width:700px;" src="${img}" /><br />
${eval_name}

        </td>
    </tr>
  </tbody>
</table>
<div class="em_hide" style="white-space: nowrap; display: none; font-size:0px; line-height:0px;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div>
</body></html>
`