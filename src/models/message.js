/** @format */

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sentBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
