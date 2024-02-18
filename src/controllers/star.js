const User = require("../models/user");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");

// Getting a User Stars
const getUserStars = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findOne({ _id: userId }).populate(
    "starred",
    "-password -image -interest -role -createdAt -updatedAt -__v -starred -liked"
  );
  res.status(200).json({ starred: user.starred });
};

// Liking a User
const starUser = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  if (!validateMongoId(id)) {
    return next(customError(400, `ID:${id} is not a valid Id`));
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          starred: id,
        },
      }
    );
    res.status(200).json({ message: "Starred!" });
  } catch (err) {
    next(err);
  }
};

//Unlikng a user
const unStarUser = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  if (!validateMongoId(id)) {
    return next(customError(400, `ID:${id} is not a valid Id`));
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: {
          starred: id,
        },
      }
    );
    res.status(200).json({ message: "Removed from Stars!" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserStars,
  starUser,
  unStarUser
};
