const express = require("express"); //'express' c'est le package deja installé
const cors = require("cors"); //pour que le serveur accepte la requete qui vient du port 3000
const mongoose = require("mongoose");
const userRouter = require("./routers/user.router");
const adminRouter = require("./routers/admin.router");
require("dotenv").config();
const uploadRouter = require("./routers/upload.router");
const commentsRouter = require("./routers/comments.router");
const passwordRouter = require("./routers/passwordf.router");
const chartRouter = require("./routers/chart.router");
const app = express(); //instance d'express nommé app

app.use(cors());
app.use(express.json());
app.use("/user", userRouter);
app.use("/uploads", uploadRouter);
app.use("/admin", adminRouter);
app.use("/comments", commentsRouter);
app.use("/password", passwordRouter);
app.use("/chart", chartRouter);
const mongoURI =
  "mongodb+srv://ranimba:21428118@cluster0.sa78t.mongodb.net/pfe2?retryWrites=true&w=majority";

//database connexion
mongoose
  .connect(
    "mongodb+srv://ranimba:21428118@cluster0.sa78t.mongodb.net/pfe2?retryWrites=true&w=majority"
  )
  .then(
    () => {
      console.log("Database connected ");
    },
    (err) => {
      console.log("error   ", err);
    }
  );

const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// init gfs
let gfs;
let gfsJoin;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  gfsJoin = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "join",
  });
  app.locals.gfs = gfs;
  app.locals.gfsJoin = gfsJoin;
});
conn.on("error", function (err) {
  console.log(err);
});
//Demarrage serveur
app.listen(8080, () => {
  console.log("server started on port 8080");
});
