const express = require("express");
const { check } = require("express-validator");
const userControllers = require("../controllers/user-controllers");
const router = express.Router();
const fileUpload = require('../middleware/file-upload')

router.get("/", userControllers.getUsers);

router.post(
  "/signup",
fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("password").isLength({ min: 7 }),
    check("email").normalizeEmail().isEmail(),
  ],
  userControllers.signup
);

router.post("/login", userControllers.login);

module.exports = router;
