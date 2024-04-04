const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");

exports.getUserStars = async (userId) => {
  const userProfile = await UserProfile.findOne({ userId })
    .populate({
      path: "starred",
      select: "image",
      populate: {
        path: "userId",
        select: "firstName lastName",
      },
    })
    .select("starred");

  return { starred: userProfile.starred };
};

exports.starUser = async (userId, starredUserId) => {
  if (!validateMongoId(starredUserId)) {
    throw customError(400, `ID:${starredUserId} is not a valid Id`);
  }

  const userProfile = await UserProfile.findOneAndUpdate(
    { userId },
    { $push: { starred: starredUserId } }
  );

  return { message: "Starred!" };
};

exports.unStarUser = async (userId, unstarredUserId) => {
  if (!validateMongoId(unstarredUserId)) {
    throw customError(400, `ID:${unstarredUserId} is not a valid Id`);
  }

  const userProfile = await UserProfile.findOneAndUpdate(
    { userId },
    { $pull: { starred: unstarredUserId } }
  );

  return { message: "Removed from Stars!" };
};
