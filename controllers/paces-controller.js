const HttpError = require("../model/http-error");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const Place = require("../model/model");
const User = require("../model/user");
const mongoose = require("mongoose");
const fs = require("fs");


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "could not find the place with the given id.",
      500
    );
    return next(error);
  }
  if (!place) {
    const error = new HttpError(
      "Sorry the page you requested cannot be found.",
      404
    );
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // let place;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "could not find the place with the given user id.",
      500
    );
    return next(error);
  }
  if (!userWithPlaces || userWithPlaces.places.length == 0) {
    const error = new HttpError(
      "Sorry the page you requested cannot be found for the given user id.",
      404
    );
    return next(error);
  }
  res.json({
    place: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(req.userData)
  console.log(errors,'createplace')

  if (!errors.isEmpty()) {
    throw new HttpError("Error please check your imputs.", 422);
  }
  const { title, description, address } = req.body;
  const coordinates = getCoordsForAddress(address);
  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    image: req.file.path,
    address,
    creator:req.userData.userId
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
    console.log(user,'userbhitra')
  } catch (err) {
    const error = new HttpError(
      "creation of place failed please try again later 1",
      500
    );
    console.log(err,'4');
    console.log(req.userData,'data')

    return next(error);
  }
  if (!user) {
    const error = new HttpError(
      "could not find the user of the given id.",
      404
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    await sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
    console.log('complete')
  } catch (err) {
    const error = new HttpError(
      "creation of place failed please try again later 2",
      500
    );
    console.log(err,'3');
    return next(error);
  }

  try {
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError(
      "creation of place failed please try again later 3",
      500
    );
    console.log(err);
    return next(error);
  }
  console.log('place')
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "could not find the place with the given id.",
      500
    );
    return next(error);
  }
  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this place.", 401);
    return next(error);
  }
  place.title = title;
  place.description = description;

  await place.save();
  res.json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
    console.log(place);
  } catch (err) {
    const error = new HttpError(
      "something went wrong, couldn't delete place",
      500
    );
    console.log(err,'2');
    return next(error);
  }
  if (!place) {
    const error = new HttpError(
      "could not find the place with the given id.",
      500
    );
    console.log(err,'1');
    return next(error);
  }

  if(place.creator.id !== req.userData.userId){
    const error = new HttpError("You are not allowed to delete this place.", 401);
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    await sess.startTransaction();
    await place.remove({ session: sess });
    await fs.unlink(place.image, (err) => {
      console.log(err, "hisassbba");
    }),
      place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "something went wrong, couldn't delete place",
      500
    );
    return next(error);
  }

  res.json({ message: "deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
