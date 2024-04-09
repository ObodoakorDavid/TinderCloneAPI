const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");

exports.getUserBlocks = async (userId) => {
  const userProfile = await UserProfile.findOne({ userId })
    .populate({
      path: "blocked",
      select: "image interest about userId",
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

  console.log(userProfile);

  if (userProfile) {
    throw customError(400, "You already blocked this user!");
  }

  const blockedUserProfile = await UserProfile.findOne({
    userId: blockedUserId,
  });

  if (!blockedUserProfile) {
    throw customError(400, `No User with ID:${blockedUserId}`);
  }
  console.log(blockedUserProfile._id);

  await UserProfile.findOneAndUpdate(
    { userId },
    {
      $addToSet: { blocked: blockedUserProfile._id },
    }
  );

  return { message: "Blocked!" };
};

exports.unblockUser = async (userId, unblockedUserId) => {
  if (!validateMongoId(unblockedUserId)) {
    throw customError(400, `ID:${unblockedUserId} is not a valid Id`);
  }

  const userProfile = await UserProfile.findOne({ userId });

  if (!userProfile) {
    throw customError(404, "User profile not found");
  }

  const unblockedUserProfile = await UserProfile.findOne({
    userId: unblockedUserId,
  });

  if (!unblockedUserProfile) {
    throw customError(400, `No User with ID:${unblockedUserId}`);
  }

  console.log(unblockedUserProfile._id);
  console.log(unblockedUserId);

  const zz = await UserProfile.findOneAndUpdate(
    { userId },
    { $pull: { blocked: unblockedUserProfile._id } },
    { new: true }
  );

  console.log(zz);

  return { message: "Unblocked!" };
};

exports.isBlockedByUser = async (userId, otherUserId) => {
  if (!validateMongoId(userId)) {
    throw customError(400, `ID:${userId} is not a valid Id`);
  }

  if (!validateMongoId(otherUserId)) {
    throw customError(400, `ID:${otherUserId} is not a valid Id`);
  }

  const otherUserProfile = await UserProfile.findOne({
    userId: otherUserId,
  });

  if (!otherUserProfile) {
    throw customError(400, `No User with ID:${otherUserId}`);
  }

  const isBlocked = await UserProfile.findOne({
    userId,
    blocked: { $in: [otherUserProfile._id] },
  });

  if (isBlocked) {
    throw customError(400, "You've blocked this user");
  }
};
