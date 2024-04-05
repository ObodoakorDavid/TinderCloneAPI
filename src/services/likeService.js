const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");
const Match = require("../models/match");

exports.getUserLikes = async (userId) => {
  const userProfile = await UserProfile.findOne({ userId })
    .populate({
      path: "liked",
      select: "image interest userId",
      populate: {
        path: "userId",
        select: "firstName lastName",
      },
    })
    .select("liked")
    .lean();

  if (!userProfile) {
    throw customError(404, "User Doesn't Exist");
  }

  return userProfile.liked;
};

exports.likeUser = async (userId, likedUserId) => {
  if (!validateMongoId(likedUserId)) {
    throw customError(400, `ID:${likedUserId} is not a valid Id`);
  }

  const userProfile = await UserProfile.findOne({
    userId,
    liked: { $in: [likedUserId] },
  });

  if (userProfile) {
    throw customError(400, "You already liked this user!");
  }

  const likedUserProfile = await UserProfile.findOne({ userId: likedUserId });

  if (!likedUserProfile) {
    throw customError(400, `No User with ID:${likedUserId}`);
  }

  await UserProfile.findOneAndUpdate(
    { userId },
    {
      $addToSet: { liked: likedUserProfile._id },
      $pull: { disLiked: likedUserProfile._id },
    },
    { new: true }
  );

  let isMatch = false;

  //  Creates A Match if Both Users like Each Other
  if (likedUserProfile && likedUserProfile.liked.includes(userId)) {
    isMatch = true;
    await Match.create({ members: [userId, likedUser.userId] });
  }

  return {
    message: "Liked!",
    isMatch,
  };
};

exports.unlikeUser = async (userId, unlikedUserId) => {
  if (!validateMongoId(unlikedUserId)) {
    throw customError(400, `ID:${unlikedUserId} is not a valid Id`);
  }

  const userProfile = await UserProfile.findOne({ userId });

  if (!userProfile) {
    throw customError(404, "User profile not found");
  }

  const unlikedUserProfile = await UserProfile.findOne({
    userId: unlikedUserId,
  });

  if (!unlikedUserProfile) {
    throw customError(400, `No User with ID:${unlikedUserId}`);
  }

  await UserProfile.findOneAndUpdate(
    { userId },
    { $pull: { liked: unlikedUserProfile._id } },
    { new: true }
  );

  // Removes the match
  await Match.findOneAndDelete({ members: [userId, unlikedUserId] });

  return { message: "Removed from Likes!" };
};
