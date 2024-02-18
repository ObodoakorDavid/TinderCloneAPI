const express = require("express");
const methodNotAllowed = require("../utils/methodNotAllowed");
const { createMessage, getMessages } = require("../controllers/message");
const router = express.Router();

router.route("/").post(createMessage).all(methodNotAllowed);
router.route("/:chatId").get(getMessages).all(methodNotAllowed);

module.exports = router;
