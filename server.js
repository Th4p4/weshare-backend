const express = require("express");
const path = require('path')
const bodyParser = require("body-parser");
const HttpError = require("./model/http-error");
const placeRoutes = require("./routes/places-route");
const userRoutes = require("./routes/users-route");
const mongoose = require("mongoose");
const fs = require('fs')

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With,Content-Type,Accept,Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  next();
});

app.use("/api/places", placeRoutes);
app.use("/api/users", userRoutes);
app.use('/upload/images/', express.static(path.join('upload','images')))

app.use((req, res, next) => {
  error = new HttpError("Page not found", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if(req.file){
    fs.unlink(req.file.path,(err)=>{
      // console.log(err,'hisasa')
    })
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.status || 500);
  res.json({ message: error.message || "unknown error occured" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dvh5d.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch(() => {
    console.log("Connection failed.");
  });
