const mongoose = require("mongoose");

//le modele "user" de la base Mango
const commentsschema = new mongoose.Schema({
  topic: String,
  content: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  createdAt: Date,
  //number: Number,
});

const commentsModel = mongoose.model("comments", commentsschema);
module.exports = commentsModel;
