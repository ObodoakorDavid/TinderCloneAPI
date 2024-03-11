const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/demmgc49v/image/upload/v1695969739/default-avatar_scnpps.jpg",
    },
    profession: {
      type: String,
    },
    jobTitle: {
      type: String,
    },
    location: {
      type: String,
    },
    about: {
      type: String,
    },
    interest: [{ type: String }],
    starred: {
      type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      default: [],
    },
    liked: {
      type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      default: [],
    },
    birthday: {
      type: String,
    },
    gender: {
      type: String,
    },
    height: {
      type: String,
    },
    photos: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// UserProfileSchema.pre("save", async function (next) {
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

UserProfileSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

// UserProfileSchema.methods.comparePassword = async function (incomingPassword) {
//   const isMatch = await bcrypt.compare(incomingPassword, this.password);
//   return isMatch;
// };

module.exports = mongoose.model("UserProfile", UserProfileSchema);
