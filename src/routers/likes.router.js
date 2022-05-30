const express = require("express");
const router = express.Router();
const likesController = require("../controllers/likes.controller");
const jwtHandling = require("../services/jwt");
const userGuard = require("../guards/user.guard");

router.post("/:id/addlike", likesController.addlike);
router.get("/:id/getlikepercomment", likesController.getLikeForEachComment);

/*router.post(
  "/draw/:id/:userId?",
  [jwtHandling.jwtVerify, userGuard],
  chartController.drawSimple
);*/

module.exports = router;
