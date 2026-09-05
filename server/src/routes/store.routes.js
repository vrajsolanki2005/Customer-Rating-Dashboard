const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { ratingSchema } = require("../validators/store.validator");
const { getStores, submitRating, updateRating } = require("../controllers/store.controller");

router.use(authenticate);

router.get("/", getStores);

router.post("/:storeId/rating", validate(ratingSchema), submitRating);

router.put("/:storeId/rating", validate(ratingSchema), updateRating);

module.exports = router;
