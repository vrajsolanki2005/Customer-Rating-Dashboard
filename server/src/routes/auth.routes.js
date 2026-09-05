const express = require("express");

const router = express.Router();

const {
  signup,
  login,
  getMe,
  changePassword,
  logout,
} = require("../controllers/auth.controller");

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validate");

const {
  signupSchema,
  loginSchema,
  changePasswordSchema,
} = require("../validators/auth.validator");

// Normal user registration
router.post(
  "/signup",
  validate(signupSchema),
  signup
);

// All roles login
router.post(
  "/login",
  validate(loginSchema),
  login
);

// Current logged-in user
router.get(
  "/me",
  authenticate,
  getMe
);

// Change password
router.patch(
  "/password",
  authenticate,
  validate(changePasswordSchema),
  changePassword
);

// Logout
router.post(
  "/logout",
  authenticate,
  logout
);

module.exports = router;