const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");

// Getting a User Likes
const getUserLikes = async (req, res) => {
  const { userId } = req.user;
  const UserProfile = await UserProfile.findOne({ _id: userId }).populate(
    "liked",
    "-password -image -interest -role -createdAt -updatedAt -__v -starred -liked"
  );
  res.status(200).json({ likes: UserProfile.liked });
};

// Liking a User
const likeUser = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  if (!validateMongoId(id)) {
    return next(customError(400, `ID:${id} is not a valid Id`));
  }

  try {
    const userProfile = await UserProfile.findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: {
          liked: id,
        },
      }
    );
    const likedUser = await UserProfile.findOne({ _id: id });

    if (likedUser.liked.includes(userId)) {
      return res.json({ message: "Liked!", isMatch: true });
    }
    res.status(200).json({ message: "Liked!", isMatch: false });
  } catch (err) {
    next(err);
  }
};

//Unlikng a user
const unLikeUser = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  if (!validateMongoId(id)) {
    return next(customError(400, `ID:${id} is not a valid Id`));
  }

  try {
    const userProfile = await UserProfile.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          liked: id,
        },
      }
    );
    res.status(200).json({ message: "Removed from Likes!" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserLikes,
  likeUser,
  unLikeUser,
};
