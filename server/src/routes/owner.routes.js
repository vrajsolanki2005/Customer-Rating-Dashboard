const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const { getOwnerDashboard, updateStore } = require("../controllers/owner.controller");
const { updateStoreSchema } = require("../validators/admin.validator");

router.use(authenticate);
router.use(authorize("STORE_OWNER"));

router.get("/dashboard", getOwnerDashboard);
router.patch("/stores/:id", validate(updateStoreSchema), updateStore);

module.exports = router;