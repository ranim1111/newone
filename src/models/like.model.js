const mongoose = require("mongoose");

//le modele "comments" de la base Mongo
const likeschema = new mongoose.Schema({
  text: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  createdAt: Date,
});

const likeModel = mongoose.model("likes", likeschema);
module.exports = likeModel;
