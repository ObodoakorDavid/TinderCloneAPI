const UserProfile = require("../models/userProfile");
const User = require("../models/users");
const customError = require("../utils/customError");

exports.updateUserProfile = async (userId, userDetails) => {
  // Updating userProfile model
  const userProfile = await UserProfile.findOneAndUpdate(
    { userId },
    userDetails
  );
  return { message: "Details Updated Successfully!", userProfile };
};

exports.updateUserModel = async (userId, userInfo) => {
  // Updating user model
  await User.findByIdAndUpdate(userId, userInfo);
  return { message: "User Info Updated Successfully!" };
};

exports.validatePassword = async (userId, password) => {
  if (!password) {
    throw customError(401, "Please provide password");
  }
  const userProfile = await UserProfile.findOne({ userId });
  if (!userProfile) {
    throw customError(404, "This User Doesn't Exist");
  }

  const user = await User.findOne({ _id: userId });
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw customError(401, "Unauthorized");
  }
};

exports.registerUser = async (userData) => {
  const user = await User.create({ ...userData });
  const userProfile = await UserProfile.create({ userId: user._id });
  return { user, userProfile };
};
