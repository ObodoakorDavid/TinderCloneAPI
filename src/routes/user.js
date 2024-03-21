const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");

const methodNotAllowed = require("../utils/methodNotAllowed");
const {
  getSingleUser,
  getAllUsers,
  getAllMatches,
} = require("../controllers/user");

router.route("/").get(getAllUsers).all(methodNotAllowed);
router.route("/matches").get(auth, getAllMatches).all(methodNotAllowed);
router.route("/:id").get(getSingleUser).all(methodNotAllowed);

module.exports = router;
