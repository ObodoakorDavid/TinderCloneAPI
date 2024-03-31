const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");

exports.getUserBlocks = async (userId) => {
  const userProfile = await UserProfile.findOne({ userId })
    .populate({
      path: "blocked",
      select: "image interest",
      populate: {
        path: "userId",
        select: "firstName lastName",
      },
    })
    .select("blocked");

  if (!userProfile) {
    throw new Error("User Doesn't Exist");
  }

  return userProfile.blocked;
};

exports.blockUser = async (userId, blockedUserId) => {
  if (!validateMongoId(blockedUserId)) {
    throw customError(400, `ID:${blockedUserId} is not a valid Id`);
  }

  const userProfile = await UserProfile.findOne({
    userId,
    blocked: { $in: [blockedUserId] },
  });

  if (userProfile) {
    throw customError(400, "You already blocked this user!");
  }

  await UserProfile.updateOne(
    { userId },
    { $addToSet: { blocked: blockedUserId } }
  );

  return { message: "Blocked!" };
};

exports.unblockUser = async (userId, unblockedUserId) => {
  if (!validateMongoId(unblockedUserId)) {
    throw customError(400, `ID:${unblockedUserId} is not a valid Id`);
  }

  await UserProfile.updateOne(
    { userId },
    { $pull: { blocked: unblockedUserId } }
  );

  return { message: "Unblocked!" };
};
