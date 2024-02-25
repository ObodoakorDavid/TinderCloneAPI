const express = require("express");
const methodNotAllowed = require("../utils/methodNotAllowed");
const { createMessage, getMessages } = require("../controllers/message");
const { auth } = require("../middlewares/auth");
const router = express.Router();

router
  .route("/:recepientId")
  .post(auth, createMessage)
  .get(auth, getMessages)
  .all(methodNotAllowed);

module.exports = router;
