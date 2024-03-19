const express = require("express");
const router = express.Router();
const methodNotAllowed = require("../utils/methodNotAllowed");
const { auth } = require("../middlewares/auth");
const {
  getUserBlocks,
  blockUser,
  unBlockUser,
} = require("../controllers/block");

router.route("/").get(auth, getUserBlocks).all(methodNotAllowed);
router
  .route("/:id")
  .post(auth, blockUser)
  .delete(auth, unBlockUser)
  .all(methodNotAllowed);

module.exports = router;
