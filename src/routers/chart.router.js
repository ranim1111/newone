const express = require("express");
const router = express.Router();
const chartController = require("../controllers/chart.controller");
const jwtHandling = require("../services/jwt");
const userGuard = require("../guards/user.guard");

router.post(
  "/draw/:id/:userId?",
  [jwtHandling.jwtVerify, userGuard],
  chartController.drawSimple
);

module.exports = router;
