const commentDao = require("../dao/comment.dao");
const replyModel = require("../models/reply.model");

const mongoose = require("mongoose");
const commentsModel = require("../models/comments.model");
const { StatusCodes } = require("http-status-codes");

class commentsController {
  /*async addReply(req, res) {
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
      commentId.reply.push(commentId._id);
      await post.save();

      return res.status(StatusCodes.CREATED).json(commentId);
      //return res.status(StatusCodes.CREATED).json("added");
    } catch (error) {
      return error;
    }
  }*/
  async addComment(req, res) {
    try {
      const { topic, content } = req.body;
      const userId = req.infos.authId;
      //const createdAt = Date.now().toISOString();
      const comment = new commentsModel({
        topic,
        content,
        userId,
        createdAt: Date.now(),
        likes: [userId],
      });
      await comment.save();
      //console.log("added");
      return res.status(StatusCodes.CREATED).json("added");
    } catch (error) {
      //console.log(error);
      return error;
    }
  }
  async commentslist(req, res, next) {
    const result = await commentsModel.find().populate("userId").exec();
    return res.status(StatusCodes.OK).json(result);
  }
  async deletecomment(req, res, next) {
    try {
      const result = await commentsModel
        .findById(req.params.id)
        .populate("userId")
        .exec();
      if (!result) {
        return res.status(StatusCodes.NOT_FOUND).json("Comment not found");
      }
      if (result.userId._id.toString() !== req.infos.authId) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json("Cannot delete this comment");
      }
      const deleteResult = await commentsModel
        .findByIdAndRemove(req.params.id)
        .exec();
      return res.status(StatusCodes.OK).json({ msg: deleteResult });
    } catch (e) {
      console.log(e);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e.toString());
    }
  }
  async updatecomment(req, res, next) {
    try {
      const result = commentsModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        (error, data) => {
          if (error) {
            return next(error);
          } else {
            res.json(data);
            console.log("Comment updated successfully !");
          }
        }
      );
    } catch (e) {
      console.log(e);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e.toString());
    }
  }

  async getCommentById(req, res, next) {
    try {
      const comById = await commentDao.findComById(req.params.id);
      if (comById.success === false) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json("Can not get comments ");
      }
      if (!comById.data) {
        return res.status(StatusCodes.NOT_FOUND).json("Comment not found");
      }

      return res.status(StatusCodes.OK).json(comById.data);
    } catch (error) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json("Error..please try again");
    }
  }
  async likecomment(req, res, next) {
    const likeStatus = req.body.likeStatus;
    if (likeStatus === 0) {
      commentsModel
        .updateOne(
          { _id: req.params.id },
          { $inc: { likes: -1 }, $pull: { usersLiked: userIdentifiant } }
        )
        .then(() => {
          return commentsModel.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: +1 },
              $pull: { usersDisliked: userIdentifiant },
            }
          );
        })
        .then(() => {
          res.status(201).json({
            message: ["Like has been canceled", "Dislike has been canceled"],
          });
        })
        .catch((error) => res.status(400).json(error));
    }
  }
  async dislikecomment(req, res, next) {}
}

module.exports = new commentsController();
