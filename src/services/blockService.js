const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");

exports.getUserBlocks = async (userId) => {
  try {
    const userProfile = await UserProfile.findOne({ _id: userId })
      .populate({
        path: "blocked",
        select: "image interest",
        populate: {
          path: "userId",
          select: "-_id firstName lastName",
        },
      })
      .select("blocked");

    if (!userProfile) {
      throw new Error("User Doesn't Exist");
    }

    return userProfile.blocked;
  } catch (error) {
    console.error("Error fetching blocked profiles:", error);
    throw new Error("Error fetching blocked profiles");
  }
};

exports.blockUser = async (userId, blockedUserId) => {
  try {
    if (!validateMongoId(blockedUserId)) {
      throw customError(400, `ID:${blockedUserId} is not a valid Id`);
    }

    const userProfile = await UserProfile.findOne({
      _id: userId,
      blocked: { $in: [blockedUserId] },
    });

    if (userProfile) {
      throw customError(400, "You already blocked this user!");
    }

    await UserProfile.updateOne(
      { _id: userId },
      { $addToSet: { blocked: blockedUserId } }
    );

    return { message: "Blocked!" };
  } catch (error) {
    throw error;
  }
};

exports.unblockUser = async (userId, unblockedUserId) => {
  try {
    if (!validateMongoId(unblockedUserId)) {
      throw customError(400, `ID:${unblockedUserId} is not a valid Id`);
    }

    await UserProfile.updateOne(
      { _id: userId },
      { $pull: { blocked: unblockedUserId } }
    );

    return { message: "Unblocked!" };
  } catch (error) {
    throw error;
  }
};
