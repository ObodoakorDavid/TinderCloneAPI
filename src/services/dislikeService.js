const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");
const Match = require("../models/match");

exports.getUserDislikes = async (userId) => {
  const userProfile = await UserProfile.findOne({ userId })
    .populate({
      path: "disLiked",
      select: "image interest",
      populate: {
        path: "userId",
        select: "-_id firstName lastName",
      },
    })
    .select("disliked");

  if (!userProfile) {
    throw new Error("User Doesn't Exist");
  }

  return userProfile.disLiked;
};

exports.dislikeUser = async (userId, dislikedUserId) => {
  if (!validateMongoId(dislikedUserId)) {
    throw customError(400, `ID:${dislikedUserId} is not a valid Id`);
  }

  const userProfile = await UserProfile.findOne({
    userId,
    disLiked: { $in: [dislikedUserId] },
  });

  if (userProfile) {
    throw customError(400, "You already disliked this user!");
  }

  await UserProfile.updateOne(
    { userId },
    {
      $addToSet: { disLiked: dislikedUserId },
      $pull: { liked: dislikedUserId },
    }
  );

  return { message: "Disliked!" };
};

exports.undislikeUser = async (userId, undislikedUserId) => {
  if (!validateMongoId(undislikedUserId)) {
    throw customError(400, `ID:${undislikedUserId} is not a valid Id`);
  }

  await UserProfile.updateOne(
    { userId },
    { $pull: { disLiked: undislikedUserId } }
  );

  return { message: "Removed from Dislikes!" };
};
