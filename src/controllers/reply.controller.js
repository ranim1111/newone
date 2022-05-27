const replyModel = require("../models/reply.model");
const { StatusCodes } = require("http-status-codes");
const commentsModel = require("../models/comments.model");
const commentDao = require("../dao/comment.dao");

class replyController {
  async addReply(req, res) {
    try {
      const { text } = req.body;
      const commentId = await commentDao.findComById(req.params.id);
      //return res.status(StatusCodes.CREATED).json(commentId);
      //const userId = req.infos.authId;

      const reply = new replyModel({
        text,
        //userId,
        commentId: commentId.data._id,
        createdAt: Date.now(),
      });
      await reply.save();
      // Associate Post with reply

      return res.status(StatusCodes.CREATED).json("added");
    } catch (error) {
      return error;
    }
  }
  async getReplies(req, res, next) {
    const result = await replyModel
      .find()
      .populate("userId")
      .populate("commentId")
      .exec();
    return res.status(StatusCodes.OK).json(result);
  }
}
module.exports = new replyController();
