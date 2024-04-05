const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");

exports.getUserDislikes = async (userId) => {
  const userProfile = await UserProfile.findOne({ userId })
    .populate({
      path: "disLiked",
      select: "image interest userId",
      populate: {
        path: "userId",
        select: "firstName lastName",
      },
    })
    .select("disliked");

  if (!userProfile) {
    throw customError(404, "User Doesn't Exist");
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

  const dislikedUserProfile = await UserProfile.findOne({
    userId: dislikedUserId,
  });

  if (!dislikedUserProfile) {
    throw customError(400, `No User with ID:${starredUserId}`);
  }

  await UserProfile.updateOne(
    { userId },
    {
      $addToSet: { disLiked: dislikedUserProfile._id },
      $pull: { liked: dislikedUserProfile._id },
    }
  );

  return { message: "Disliked!" };
};

exports.undislikeUser = async (userId, undislikedUserId) => {
  if (!validateMongoId(undislikedUserId)) {
    throw customError(400, `ID:${undislikedUserId} is not a valid Id`);
  }

  const userProfile = await UserProfile.findOne({ userId });

  if (!userProfile) {
    throw customError(404, "User profile not found");
  }

  const undislikedUserProfile = await UserProfile.findOne({
    userId: undislikedUserId,
  });

  if (!undislikedUserProfile) {
    throw customError(400, `No User with ID:${undislikedUserId}`);
  }

  await UserProfile.updateOne(
    { userId },
    { $pull: { disLiked: undislikedUserProfile._id } }
  );

  return { message: "Removed from Dislikes!" };
};
