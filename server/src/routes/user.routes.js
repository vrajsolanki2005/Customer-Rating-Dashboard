const express = require("express");

const router = express.Router();

const { getStores } = require("../controllers/user.controller");

const {
  submitRating,
  modifyRating,
} = require("../controllers/rating.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const { ratingSchema } = require("../validators/rating.validator");

router.use(authenticate);
router.use(authorize("USER"));

/*
  GET /api/user/stores

  Query parameters:
  ?name=abc
  ?address=vadodara
  ?email=abc
  ?sortBy=name
  ?order=asc
  ?page=1
  ?limit=10
*/
router.get("/stores", getStores);

//submit rating
router.post(
  "/stores/:storeId/rating",
  validate(ratingSchema),
  submitRating
);

//modify rating
router.put(
  "/stores/:storeId/rating",
  validate(ratingSchema),
  modifyRating
);

module.exports = router;