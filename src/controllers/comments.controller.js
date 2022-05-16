const userDao = require("../dao/user.dao");
const userModel = require("../models/user.model");
const mongoose = require("mongoose");
const commentsModel = require("../models/comments.model");
const { StatusCodes } = require("http-status-codes");
const { json } = require("express");
const moment = require("moment");

class commentsController {
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
        return res.status(StatusCodes.NOT_FOUND).json("comment not found");
      }
      if (result.userId._id.toString() !== req.infos.authId) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json("cannot delete this comment");
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
    commentsModel.findByIdAndUpdate(
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
  }

  async getCommentByUserId(req, res, next) {
    const userId = mongoose.Types.ObjectId(req.params.id);
    //const userId = req.params.userId._id;
    json(userId);
    const result = await commentsModel.find(userId); //.populate("userId").exec();
    return res.status(StatusCodes.OK).json(result);
  }
}

module.exports = new commentsController();
