const express = require("express");
const { startChat, findUserChats, findChat } = require("../controllers/chat");
const methodNotAllowed = require("../utils/methodNotAllowed");
const router = express.Router();

router.route("/").get(startChat).all(methodNotAllowed);
router.route("/:userId").get(findUserChats).all(methodNotAllowed);
router.route("/:firstId/:secondId").get(findChat).all(methodNotAllowed);

module.exports = router;
