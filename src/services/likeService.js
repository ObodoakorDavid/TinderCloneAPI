const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");
const Match = require("../models/match");

exports.getUserLikes = async (userId) => {
  try {
    const userProfile = await UserProfile.findOne({ _id: userId })
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
  } catch (error) {
    console.error("Error fetching liked profiles:", error);
    throw new Error("Error fetching liked profiles");
  }
};

exports.likeUser = async (userId, likedUserId) => {
  try {
    if (!validateMongoId(likedUserId)) {
      throw customError(400, `ID:${likedUserId} is not a valid Id`);
    }

    const userProfile = await UserProfile.findOne({
      _id: userId,
      liked: { $in: [likedUserId] },
    });

    if (userProfile) {
      throw customError(400, "You already liked this user!");
    }

    await UserProfile.updateOne(
      { _id: userId },
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
  } catch (error) {
    throw error;
  }
};

exports.unlikeUser = async (userId, unlikedUserId) => {
  try {
    if (!validateMongoId(unlikedUserId)) {
      throw customError(400, `ID:${unlikedUserId} is not a valid Id`);
    }

    await UserProfile.updateOne(
      { _id: userId },
      { $pull: { liked: unlikedUserId } }
    );
    // Removes the match
    await Match.findOneAndDelete({ members: [userId, unlikedUserId] });

    return { message: "Removed from Likes!" };
  } catch (error) {
    throw error;
  }
};
