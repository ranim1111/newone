const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments.controller");
const adminGuard = require("../guards/admin.guard");
const jwtHandling = require("../services/jwt");
const replyController = require("../controllers/reply.controller");

router.get("/replies", replyController.getReplies);
router.get("/:id?/getreply", replyController.getRepliesForEachComment);

router.post(
  "/:id?/addreply",
  //[jwtHandling.jwtVerify, adminGuard],
  replyController.addReply
);
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
router.put(
  "/updatecomment/:id",
  [jwtHandling.jwtVerify, adminGuard],
  commentsController.updatecomment
);
router.put("/likecomment/:id", commentsController.likecomment);
/*router.get(
  "/getCommentByUserName/:userId",
  [jwtHandling.jwtVerify, adminGuard],
  commentsController.getCommentByUserName
);*/
router.get(
  "/getCommentById/:id?",

  commentsController.getCommentById
);
router.get(
  "/getCommentByUser/:userId?",
  [jwtHandling.jwtVerify, adminGuard],
  commentsController.getCommentByUser
);
module.exports = router;
