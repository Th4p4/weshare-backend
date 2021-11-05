const express = require("express");
const { check } = require("express-validator");
const placeControllers = require("../controllers/paces-controller");
const checkAuth = require("../middleware/check-auth");
const router = express.Router();
const fileUpload = require('../middleware/file-upload')

router.get("/:pid", placeControllers.getPlaceById);

router.get("/users/:uid", placeControllers.getPlacesByUserId);

router.use(checkAuth)

router.post(
  "/",
  fileUpload.single('image'),
  [
    check("title").not().isEmpty(),
    check("description").isLength({min:5}),
    check("address").not().isEmpty(),
  ],
  placeControllers.createPlace
);

router.patch("/:pid", placeControllers.updatePlace);

router.delete("/:pid", placeControllers.deletePlace);

module.exports = router;
