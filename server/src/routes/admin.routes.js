const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createUserSchema,
  createStoreSchema,
  updateUserSchema,
  updateStoreSchema,
} = require("../validators/admin.validator");

const {
  createUser,
  createStore,
  getDashboard,
  getUsers,
  getUserDetails,
  getStores,
  updateUser,
  deleteUser,
  updateStore,
  deleteStore,
} = require("../controllers/admin.controller");

// Every route below requires ADMIN
router.use(authenticate);
router.use(authorize("ADMIN"));

// Dashboard
router.get("/dashboard", getDashboard);

// Users
router.get("/users", getUsers);
router.get("/users/:id", getUserDetails);
router.post("/users", validate(createUserSchema), createUser);
router.patch("/users/:id", validate(updateUserSchema), updateUser);
router.delete("/users/:id", deleteUser);

// Stores
router.get("/stores", getStores);
router.post("/stores", validate(createStoreSchema), createStore);
router.patch("/stores/:id", validate(updateStoreSchema), updateStore);
router.delete("/stores/:id", deleteStore);

module.exports = router;