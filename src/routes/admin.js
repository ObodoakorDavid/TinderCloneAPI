const express = require("express");
const router = express.Router();
const methodNotAllowed = require("../utils/methodNotAllowed");
const {
  getAllUsers,
  suspendUser,
  unSuspendUser,
  getSuspendedUsers,
  getAllMatches,
  getRecentUsers,
  getActiveUsers,
} = require("../controllers/admin");

router.route("/users").get(getAllUsers).all(methodNotAllowed);
router.route("/users/matches").get(getAllMatches).all(methodNotAllowed);
router.route("/users/recent").get(getRecentUsers).all(methodNotAllowed);
router.route("/users/active").get(getActiveUsers).all(methodNotAllowed);
router.route("/users/suspended").get(getSuspendedUsers).all(methodNotAllowed);
router.route("/users/:userId/suspend").post(suspendUser).all(methodNotAllowed);
router
  .route("/users/:userId/unsuspend")
  .post(unSuspendUser)
  .all(methodNotAllowed);

module.exports = router;
