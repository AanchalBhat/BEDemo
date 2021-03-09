const router = require("express").Router();
const { priceMatrixService } = require("../services/index");
const requestHelper = require("../common/request_helper");
const jwtMiddleWare = require("../middleware/jwt-auth");

// get profile
router.get("/", jwtMiddleWare, async (req, res) => {
  const result = await priceMatrixService.getPaginatedMatrix(req);
  return requestHelper.handleResponse(res, result);
});

module.exports = router;
