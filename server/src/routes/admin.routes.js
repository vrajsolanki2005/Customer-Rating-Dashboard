const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createUserSchema,
  createStoreSchema,
} = require("../validators/admin.validator");

const {
  createUser,
  createStore,
  getDashboard,
  getUsers,
  getUserDetails,
  getStores,
} = require("../controllers/admin.controller");

// Every route below requires ADMIN
router.use(authenticate);
router.use(authorize("ADMIN"));

// Dashboard
router.get("/dashboard", getDashboard);

// Users
router.get("/users", getUsers);

router.get("/users/:id", getUserDetails);

router.post(
  "/users",
  validate(createUserSchema),
  createUser
);

// Stores
router.get("/stores", getStores);

router.post(
  "/stores",
  validate(createStoreSchema),
  createStore
);

module.exports = router;