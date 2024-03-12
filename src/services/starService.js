const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");

exports.getUserStars = async (userId) => {
  try {
    const userProfile = await UserProfile.findOne({ _id: userId }).populate(
      "starred",
      "-password -image -interest -role -createdAt -updatedAt -__v -starred -liked"
    );

    return { starred: userProfile.starred };
  } catch (error) {
    throw error;
  }
};

exports.starUser = async (userId, starredUserId) => {
  try {
    if (!validateMongoId(starredUserId)) {
      throw customError(400, `ID:${starredUserId} is not a valid Id`);
    }

    const userProfile = await UserProfile.findOneAndUpdate(
      { _id: userId },
      { $push: { starred: starredUserId } }
    );

    return { message: "Starred!" };
  } catch (error) {
    throw error;
  }
};

exports.unStarUser = async (userId, unstarredUserId) => {
  try {
    if (!validateMongoId(unstarredUserId)) {
      throw customError(400, `ID:${unstarredUserId} is not a valid Id`);
    }

    const userProfile = await UserProfile.findOneAndUpdate(
      { _id: userId },
      { $pull: { starred: unstarredUserId } }
    );

    return { message: "Removed from Stars!" };
  } catch (error) {
    throw error;
  }
};
