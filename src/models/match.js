const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Index the 'members' field for faster query performance
matchSchema.index({ members: 1 });

module.exports = mongoose.model("Match", matchSchema);
