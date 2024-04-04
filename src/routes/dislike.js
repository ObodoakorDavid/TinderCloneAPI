const express = require("express");
const router = express.Router();
const methodNotAllowed = require("../utils/methodNotAllowed");
const {
  getUserDislikes,
  dislikeUser,
  undislikeUser,
} = require("../controllers/dislike");
const { auth } = require("../middlewares/auth");

router.route("/").get(getUserDislikes).all(methodNotAllowed);
router
  .route("/:id")
  .post(dislikeUser)
  .delete(undislikeUser)
  .all(methodNotAllowed);

module.exports = router;
