const express = require("express");
const router = express.Router();
const methodNotAllowed = require("../utils/methodNotAllowed");
const { getUserLikes, likeUser, unLikeUser } = require("../controllers/like");
const { auth } = require("../middlewares/auth");

router.route("/").get(getUserLikes).all(methodNotAllowed);
router.route("/:id").get(likeUser).delete(unLikeUser).all(methodNotAllowed);

module.exports = router;
