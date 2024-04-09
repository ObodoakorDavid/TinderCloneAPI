const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");
const blockService = require("../services/blockService");

exports.getUserStars = async (userId) => {
  const userProfile = await UserProfile.findOne({ userId })
    .populate({
      path: "starred",
      select: "image interest userId",
      populate: {
        path: "userId",
        select: "firstName lastName",
      },
    })
    .select("starred")
    .lean();

  console.log(userProfile);

  if (!userProfile) {
    throw customError(404, "User Doesn't Exist");
  }

  return { starred: userProfile.starred };
};

exports.starUser = async (userId, starredUserId) => {
  if (!validateMongoId(starredUserId)) {
    throw customError(400, `ID:${starredUserId} is not a valid Id`);
  }

  await blockService.isBlockedByUser(userId, starredUserId);

  const userProfile = await UserProfile.findOne({
    userId,
    starred: { $in: [starredUserId] },
  });

  console.log(userProfile);

  if (userProfile) {
    throw customError(400, "You already starred this user!");
  }

  const starredUserProfile = await UserProfile.findOne({
    userId: starredUserId,
  });

  if (!starredUserProfile) {
    throw customError(400, `No User with ID:${starredUserId}`);
  }

  await UserProfile.findOneAndUpdate(
    { userId },
    { $push: { starred: starredUserProfile._id } }
  );

  return { message: "Starred!" };
};

exports.unStarUser = async (userId, unstarredUserId) => {
  if (!validateMongoId(unstarredUserId)) {
    throw customError(400, `ID:${unstarredUserId} is not a valid Id`);
  }

  await blockService.isBlockedByUser(userId, unstarredUserId);

  const userProfile = await UserProfile.findOne({ userId });

  if (!userProfile) {
    throw customError(404, "User profile not found");
  }

  const unlikedUserProfile = await UserProfile.findOne({
    userId: unstarredUserId,
  });

  if (!unlikedUserProfile) {
    throw customError(400, `No User with ID:${unstarredUserId}`);
  }

  await UserProfile.findOneAndUpdate(
    { userId },
    { $pull: { starred: unlikedUserProfile._id } }
  );

  return { message: "Removed from Stars!" };
};
