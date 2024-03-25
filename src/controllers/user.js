const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");
const matchService = require("../services/matchService");

const getAllUsers = async (req, res) => {
  const users = await UserProfile.find({})
    .populate({
      path: "userId",
      select: ["firstName", "lastName", "email"],
    })
    .select({
      isVerified: 0,
      createdAt: 0,
      updatedAt: 0,
      ["__v"]: 0,
      liked: 0,
      starred: 0,
    });
  res.status(200).json({ users });
};

const getSingleUser = async (req, res, next) => {
  const { id } = req.params;

  if (!validateMongoId(id)) {
    next(customError(400, "ID Invalid"));
  }

  const user = await UserProfile.findById(id)
    .populate({
      path: "userId",
      select: ["firstName", "lastName"],
    })
    .select({
      isVerified: 0,
      createdAt: 0,
      updatedAt: 0,
      ["__v"]: 0,
      liked: 0,
      starred: 0,
    });

  if (!user) {
    return next(customError(400, `No User with ID:${id}`));
  }

  res.status(200).json({ user });
};

const getAllMatches = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const users = await matchService.getAllMatches(userId, req.query);

    if (!users || users.length === 0) {
      throw new Error("No users found.");
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error occurred:", error);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getSingleUser,
  getAllMatches,
};
