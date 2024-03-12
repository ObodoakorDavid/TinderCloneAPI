const UserProfile = require("../models/userProfile");
const User = require("../models/user");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");

exports.updateUserProfile = async (userId, userDetails) => {
  try {
    // Updating userProfile model
    const userProfile = await UserProfile.findOneAndUpdate(
      { _id: userId },
      userDetails
    );
    return { message: "Details Updated Successfully!", userProfile };
  } catch (error) {
    throw error;
  }
};

exports.updateUserModel = async (userId, userInfo) => {
  const userProfile = await UserProfile.findOne({ _id: userId });
  try {
    // Updating user model
    await User.findOneAndUpdate({ _id: userProfile.userId }, userInfo);
    return { message: "User Info Updated Successfully!" };
  } catch (error) {
    throw error;
  }
};

exports.validatePassword = async (userId, password) => {
  if (!password) {
    throw customError(401, "Please provide password");
  }
  const userProfile = await UserProfile.findOne({ _id: userId });
  if (!userProfile) {
    throw customError(404, "This User Doesn't Exist");
  }

  const user = await User.findOne({ _id: userProfile.userId });
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw customError(401, "Unauthorized");
  }
};

exports.registerUser = async (userData) => {
  try {
    const user = await User.create({ ...userData });
    const userProfile = await UserProfile.create({ userId: user._id });

    return { user, userProfile };
  } catch (error) {
    throw error;
  }
};
