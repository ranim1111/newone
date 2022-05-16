const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments.controller");
const adminGuard = require("../guards/admin.guard");
const jwtHandling = require("../services/jwt");

router.post(
  "/addcomment/",
  [jwtHandling.jwtVerify, adminGuard],
  commentsController.addComment
);
router.post(
  "/deletecomment/:id",
  [jwtHandling.jwtVerify, adminGuard],
  commentsController.deletecomment
);
router.get(
  "/getcomment",
  [jwtHandling.jwtVerify, adminGuard],
  commentsController.commentslist
);
//router.put("/updatecomment/:id", commentsController.updatecomment);
/*router.get(
  "/getCommentByUserName/:userId",
  [jwtHandling.jwtVerify, adminGuard],
  commentsController.getCommentByUserName
);*/
router.get(
  "/getCommentByUserId/:userId",
  [jwtHandling.jwtVerify, adminGuard],
  commentsController.getCommentByUserId
);
//router.get("/getCommentByKey/:key", commentsController.getCommentByKey);
module.exports = router;
