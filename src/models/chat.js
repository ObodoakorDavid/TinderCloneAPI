/** @format */

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    members: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: "UserProfile",
          required: true,
        },
      ],
    },
    messages: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Message",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index the 'members' field for faster query performance
chatSchema.index({ members: 1 });

module.exports = mongoose.model("Chat", chatSchema);
