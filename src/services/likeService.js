const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");
const Match = require("../models/match");

exports.getUserLikes = async (userId) => {
  const userProfile = await UserProfile.findOne({ userId })
    .populate({
      path: "liked",
      select: "image interest",
      populate: {
        path: "userId",
        select: "-_id firstName lastName",
      },
    })
    .select("liked");

  if (!userProfile) {
    throw new Error("User Doesn't Exist");
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

  await UserProfile.updateOne(
    { userId },
    { $addToSet: { liked: likedUserId } }
  );

  const likedUser = await UserProfile.findOne({ _id: likedUserId });

  let isMatch = false;

  //  Creates A Match if Both Users like Each Other
  if (likedUser.liked.includes(userId)) {
    isMatch = true;
    await Match.create({ members: [userId, likedUser._id] });
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

  await UserProfile.updateOne({ userId }, { $pull: { liked: unlikedUserId } });
  // Removes the match
  await Match.findOneAndDelete({ members: [userId, unlikedUserId] });

  return { message: "Removed from Likes!" };
};
