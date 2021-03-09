const router = require("express").Router();
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const documentRoutes = require("./documents.routes");
const agencyRoutes = require("./agency.routes");
const subContractorEvaluation = require("./sub-contractor.routes");
const vendorRoutes = require("./vendor.routes");
const priceMatrixRoutes = require("./price-matrix.routes");

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/sub-contractor", subContractorEvaluation);
router.use("/document", documentRoutes);
router.use("/agency", agencyRoutes);
router.use("/vendor", vendorRoutes);
router.use("/price-matrix", priceMatrixRoutes);

module.exports = router;
