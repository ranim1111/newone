const likeModel = require("../models/like.model");
const commentDao = require("../dao/comment.dao");

class replyController {
  async addlike(req, res) {
    try {
      const commentId = await commentDao.findComById(req.params.id);
      const like = new likeModel({
        commentId: commentId.data._id,
        createdAt: Date.now(),
      });
      //save the like information data in MongoDB

      await like.save();

      return res.status(StatusCodes.CREATED).json("added");
    } catch (error) {
      return error;
    }
  }

  async getLikeForEachComment(req, res, next) {
    try {
      const commentId = await commentDao.findComById(req.params.id);
      await likeModel
        .find({ commentId: commentId.data.id })
        .populate("commentId")

        .then((likes) => {
          res.status(200).json(likes);
        });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
}
module.exports = new replyController();
