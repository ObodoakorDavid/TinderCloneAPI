const express = require("express");
const chatController = require("../controllers/chat");
const methodNotAllowed = require("../utils/methodNotAllowed");
const { auth } = require("../middlewares/auth");
const router = express.Router();

router
  .route("/")
  .post(chatController.startChat)
  .get(chatController.getUserChats)
  .all(methodNotAllowed);

router
  .route("/:chatId")
  .post(chatController.addMessageToChat)
  .get(chatController.getChatMessages)
  .all(methodNotAllowed);

module.exports = router;
