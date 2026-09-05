const express = require("express");

const router = express.Router();

const {
  getOwnerDashboard,
} = require("../controllers/owner.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

router.use(authenticate);

router.use(authorize("STORE_OWNER"));

router.get("/dashboard", getOwnerDashboard);

module.exports = router;