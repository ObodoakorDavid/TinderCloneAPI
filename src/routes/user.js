const express = require("express");
const router = express.Router();

const methodNotAllowed = require("../utils/methodNotAllowed");
const { getSingleUser, getAllUsers } = require("../controllers/user");

router.route("/").get(getAllUsers).all(methodNotAllowed);
router.route("/:id").get(getSingleUser).all(methodNotAllowed);

module.exports = router;
