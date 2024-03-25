const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");
const Match = require("../models/match");

const excludedFields = {
  password: 0,
  role: 0,
  createdAt: 0,
  updatedAt: 0,
  __v: 0,
  isVerified: 0,
  liked: 0,
  starred: 0,
  disLiked: 0,
  blocked: 0,
  isSuspended: 0,
  lastActivityTimestamp: 0,
};

exports.getAllUsers = async (userId) => {
  try {
    const users = await UserProfile.find(
      { _id: { $ne: userId } },
      excludedFields
    ).populate({
      path: "userId",
      select: excludedFields,
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Error fetching users");
  }
};

exports.getSuspendedUsers = async (userId) => {
  try {
    const users = await UserProfile.find(
      { _id: { $ne: userId }, isSuspended: true },
      excludedFields
    ).populate({
      path: "userId",
      select: excludedFields,
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Error fetching users");
  }
};

exports.suspendUser = async (userId) => {
  try {
    if (!validateMongoId(userId)) {
      throw customError(400, `ID:${userId} is not a valid Id`);
    }

    const userProfile = await UserProfile.findOneAndUpdate(
      {
        _id: userId,
      },
      { isSuspended: true }
    );

    if (!userProfile) {
      throw customError(404, "User not found");
    }

    return { message: "User Suspended" };
  } catch (error) {
    throw error;
  }
};

exports.unSuspendUser = async (userId) => {
  try {
    if (!validateMongoId(userId)) {
      throw customError(400, `ID:${userId} is not a valid Id`);
    }

    const userProfile = await UserProfile.findOneAndUpdate(
      {
        _id: userId,
      },
      { isSuspended: false }
    );

    if (!userProfile) {
      throw customError(404, "User not found");
    }

    return { message: "User Unsuspended" };
  } catch (error) {
    throw error;
  }
};

exports.getAllMatches = async (userId) => {
  try {
    const matches = await Match.find({ _id: { $ne: userId } }).populate({
      path: "members",
      select: excludedFields,
      populate: {
        path: "userId",
        select: excludedFields,
      },
    });
    return matches;
  } catch (error) {
    throw error;
  }
};
