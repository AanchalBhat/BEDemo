const UserModel = require("./user/user.model");
const MFAModel = require("./user/mfa.model");
const DocumentModel = require("./documents/documents.model");
const AgencyModel = require("./agency/agency.model");
const AuthService = require("./auth/auth.service");
const UserService = require("./user/user.service");
const DocumentService = require("./documents/documents.service");
const AgencyService = require("./agency/agency.service");
const SubContractorEvaluationModel = require("./sub-contractor-evaluation/sub-contractor-contractor.model");
const SubContractorEvaluationService = require("./sub-contractor-evaluation/sub-contractor-evaluation.service");
const SamModel = require("./sams/sams.model");
const SamService = require("./sams/sams.service");
const VendorModel = require("./vendors/vendors.model");
const VendorService = require("./vendors/vendors.service");
const PriceMatrixModel = require("./price-matrix/price-matrix.model");
const PriceMatrixService = require("./price-matrix/price-matrix.service");

module.exports = {
  authService: new AuthService(UserModel, MFAModel),
  userService: new UserService(UserModel),
  subContractorEvaluationService: new SubContractorEvaluationService(
    SubContractorEvaluationModel
  ),
  samService: new SamService(SamModel,VendorModel),
  documentService: new DocumentService(DocumentModel),
  agencyService: new AgencyService(AgencyModel),
  vendorService: new VendorService(VendorModel),
  priceMatrixService: new PriceMatrixService(PriceMatrixModel),
};
