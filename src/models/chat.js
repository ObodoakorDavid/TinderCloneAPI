/** @format */

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
    messages: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: "Message",
          required: true,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);
