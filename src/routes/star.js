const express = require("express");
const router = express.Router();
const methodNotAllowed = require("../utils/methodNotAllowed");
const { auth } = require("../middlewares/auth");
const { getUserStars, starUser, unStarUser } = require("../controllers/star");

router.route("/").get(getUserStars).all(methodNotAllowed);
router.route("/:id").post(starUser).delete(unStarUser).all(methodNotAllowed);

module.exports = router;
