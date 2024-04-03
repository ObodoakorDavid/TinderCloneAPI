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
  lastActivityTimestamp: 0,
};

exports.getAllUsers = async (userId) => {
  const users = await UserProfile.find(
    { userId: { $ne: userId } },
    excludedFields
  ).populate({
    path: "userId",
    select: excludedFields,
  });

  return users;
};

exports.getSuspendedUsers = async (userId) => {
  const users = await UserProfile.find({
    userId: { $ne: userId },
    isSuspended: true,
  })
    .populate({
      path: "userId",
      select: excludedFields,
    })
    .select(excludedFields);

  return users;
};

exports.suspendUser = async (userId) => {
  if (!validateMongoId(userId)) {
    throw customError(400, `ID:${userId} is not a valid Id`);
  }

  const userProfile = await UserProfile.findOneAndUpdate(
    {
      userId,
    },
    { isSuspended: true }
  );

  console.log(userProfile);

  if (!userProfile) {
    throw customError(404, "User not found");
  }

  return { message: "User Suspended", userProfile };
};

exports.unSuspendUser = async (userId) => {
  if (!validateMongoId(userId)) {
    throw customError(400, `ID:${userId} is not a valid Id`);
  }

  const userProfile = await UserProfile.findOneAndUpdate(
    {
      userId,
    },
    { isSuspended: false }
  );

  if (!userProfile) {
    throw customError(404, "User not found");
  }

  return { message: "User Unsuspended" };
};

exports.getAllMatches = async (userId) => {
  const matches = await Match.find({ _id: { $ne: userId } }).populate({
    path: "members",
    select: excludedFields,
    populate: {
      path: "userId",
      select: excludedFields,
    },
  });
  return matches;
};

exports.getRecentUsers = async (userId) => {
  const recentUsers = await UserProfile.find(
    { userId: { $ne: userId } },
    excludedFields
  )
    .populate({
      path: "userId",
      select: excludedFields,
    })
    .sort({ createdAt: -1 });
  return recentUsers;
};

exports.getActiveUsers = async (userId) => {
  const activeUsers = await UserProfile.find(
    { userId: { $ne: userId } },
    excludedFields
  )
    .populate({
      path: "userId",
      select: excludedFields,
    })
    .sort({ lastActivityTimestamp: -1 });
  return activeUsers;
};
