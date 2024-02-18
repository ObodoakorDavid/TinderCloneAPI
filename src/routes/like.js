const express = require("express");
const router = express.Router();
const methodNotAllowed = require("../utils/methodNotAllowed");
const { getUserLikes, likeUser, unLikeUser } = require("../controllers/like");
const { auth } = require("../middlewares/auth");

router.route("/").get(auth, getUserLikes).all(methodNotAllowed);
router
  .route("/:id")
  .post(auth, likeUser)
  .delete(auth, unLikeUser)
  .all(methodNotAllowed);

module.exports = router;
