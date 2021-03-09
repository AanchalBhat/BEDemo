const router = require("express").Router();
const {
  documentService,
  userService,
  vendorService,
  samService,
  priceMatrixService,
  agencyService,
} = require("../services/index");
const pdfService = require("./../common/pdf-generation");
const requestHelper = require("../common/request_helper");
const jwtMiddleWare = require("../middleware/jwt-auth");

const path = require("path");

router.get("/pdf-view/:id", jwtMiddleWare, async (req, res) => {
  try {
    // market_research_document
    const techSources = [
      {
        label: "Please Select One",
        value: null,
      },
      {
        label: "GSA Advantage www.gsaadvantage.gov",
        value: "gsa_advantage",
      },
      {
        label: "Federal Supply Schedule www.fss.gsa.gov",
        value: "federal_supply_schedule",
      },
      {
        label: "Industry Day",
        value: "industry_day",
      },
      {
        label: "One-on-one industry session",
        value: "one-on-one_industry_session",
      },
      {
        label: "Request for Information (RFI)",
        value: "request_for_information_(RFI)",
      },
      {
        label: "www.beta.SAM.gov",
        value: "beta_sam",
      },
      {
        label: "https://www.thomasnet.com/",
        value: "thomasnet",
      },
      {
        label: "Capabilities Statement",
        value: "capabilities_statement",
      },
      {
        label: "Trady Study",
        value: "trade_study",
      },
      {
        label: "Trade Show/Conference",
        value: "trade_show/conference",
      },
      {
        label: "Journal Publications",
        value: "journal_publications",
      },
      {
        label: "On-line Product/Service Info",
        value: "on-line_product/service_info",
      },
      {
        label: "Test Reports",
        value: "test_reports",
      },
      {
        label: "Professional Associations",
        value: "professional_associations",
      },
      {
        label: "Order Market Research Reports",
        value: "order_market_research_reports",
      },
      {
        label: "Prior Acquisitions",
        value: "prior_acquisitions",
      },
      {
        label: "On site visit",
        value: "on_site_visit",
      },
      {
        label: "Other government sources",
        value: "other_government_sources",
      },
      {
        label: "Catalogs",
        value: "catalogs",
      },
    ];

    const companyScales = [
      {
        label: "Please Select One",
        value: null,
      },
      {
        label: "Large Business",
        value: "large_business",
      },
      {
        label: "Small Business",
        value: "small_business",
      },
      {
        label: "Women Owned Business",
        value: "women_owned_business",
      },
      {
        label: "Section 8(a) Business",
        value: "section_8(a)_business",
      },
      {
        label: "HUBZone Small Business",
        value: "hubzone_small_business",
      },
      {
        label: "Veteran Owned Small Business",
        value: "veteran_owned_small_business",
      },
      {
        label: "Service Disable Veteran Owned Small Business",
        value: "service_disable_veteran_owned_small_business",
      },
      {
        label: "Small Disadvantage Business",
        value: "small_disadvantage_business",
      },
    ];
    const agencies = await agencyService.getAgencies();
    const result = await documentService.getDocument(req);

    if (result.response.status) {
      const priceMatrix = await priceMatrixService.getAllForDocument(
        result.response.document[0].documentId
      );
      result.response.document = result.response.document.map((doc) => ({
        ...doc._doc,
        priceMatrix: priceMatrix,
        techSources,
        companyScales,
        agencyList: agencies.response.data,
      }));
    }

    const options = {
      header: {
        height: "35mm",
        contents: `<div  style="max-width: 210mm; padding-top: 7mm; font-weight: 600"  class="h4 text-center font-italic text-uppercase">market research document</div>`,
      },
    };

    const pdf = await pdfService.generatePDF(
      "market_research_document",
      result.response.document[0],
      options
    );
    requestHelper.handleResponse(res, pdf);
  } catch (Ex) {
    return requestHelper.handleResponse(
      res,
      requestHelper.respondWithJsonBody(500, { err: "Something went wrong" })
    );
  }
});

// get document
router.get("/allDocuments", jwtMiddleWare, async (req, res) => {
  const result = await documentService.getDocument(req);
  return requestHelper.handleResponse(res, result);
});

//update document
router.post("/updateDocument", jwtMiddleWare, async (req, res) => {
  const result = await documentService.updateDocument(req);
  if (result.response.status) {
    await priceMatrixService.handleMatrix(
      req.body.priceMatrix,
      result.response.document.documentId,
      result.response.document.organization,
      result.response.document.isSubmitted
    );
  }
  return requestHelper.handleResponse(res, result);
});

//create document
router.post("/createDocument", jwtMiddleWare, async (req, res) => {
  const user = await userService.getProfile(req);
  req.body["documentId"] = await documentService.generateDocumentId(
    user.response.data.agency_code
  );
  const result = await documentService.createDocument(req);
  if (result.response.status) {
    await priceMatrixService.handleMatrix(
      req.body.priceMatrix,
      result.response.document.documentId,
      result.response.document.organization,
      result.response.document.isSubmitted
    );
  }
  return requestHelper.handleResponse(res, result);
});

//delete document
router.post("/deleteDocument", jwtMiddleWare, async (req, res) => {
  const result = await documentService.deleteDocument(req);
  return requestHelper.handleResponse(res, result);
});

// user details
router.get("/get-users", jwtMiddleWare, async (req, res) => {
  const result = await userService.queryUsers(req);
  return requestHelper.handleResponse(res, result);
});

// available sources autocomplete
router.get("/get-vendors", jwtMiddleWare, async (req, res) => {
  req.query["LEGAL_BUSINESS_NAME"] = new RegExp(
    `^${req.query["LEGAL_BUSINESS_NAME"]}`,
    "i"
  );
  const select = { LEGAL_BUSINESS_NAME: 1, DUNS: 1 };
  const result = await samService.getSamData(req.query, select);
  return requestHelper.handleResponse(
    res,
    requestHelper.respondWithJsonBody(200, { status: true, result })
  );
});

// naics details
router.get("/naics-details", jwtMiddleWare, async (req, res) => {
  const result = await vendorService.getNaicsDetails(req);
  return requestHelper.handleResponse(res, result);
});

// Get a specific document
router.get("/:id", jwtMiddleWare, async (req, res) => {
  const result = await documentService.getDocument(req);
  if (result.response.status) {
    const priceMatrix = await priceMatrixService.getAllForDocument(
      result.response.document[0].documentId
    );
    result.response.document = result.response.document.map((doc) => ({
      ...doc._doc,
      priceMatrix: priceMatrix,
    }));
  }
  return requestHelper.handleResponse(res, result);
});

// paginated api
router.get("/", jwtMiddleWare, async (req, res) => {
  const result = await documentService.getPaginatedDocuments(req);
  return requestHelper.handleResponse(res, result);
});

module.exports = router;
