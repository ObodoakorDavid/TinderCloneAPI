const User = require("../models/users");
const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const sendEmail = require("../utils/sendEmail");
const OTP = require("../models/otp");
const generateOTP = require("../utils/generateOTP");
const generateEmail = require("../utils/generateEmail");
const userService = require("../services/userService");
const uploadService = require("../services/uploadService");
const asyncWrapper = require("../middlewares/asyncWrapper");
const generateToken = require("../config/generateToken");

const registerUser = asyncWrapper(async (req, res, next) => {
  //grab email, password from req.body
  const { email, password, firstName, lastName, phoneNumber } = req.body;
  if (!email || !password || !firstName || !lastName || !phoneNumber) {
    throw customError(400, "Please provide all fields");
  }

  const { user, userProfile } = await userService.registerUser(req.body);

  //generating OTP
  const otp = generateOTP();

  // Sending OTP
  const subject = "OTP Request";
  const intro = "You received this email because you registered on Duduconnect";

  const { emailBody, emailText } = generateEmail(intro, user.firstName, otp);

  const info = await sendEmail({
    to: email,
    subject,
    text: emailText,
    html: emailBody,
  });

  const result = await OTP.create({ email, otp });

  res.status(201).json({
    message: `OTP has been sent to ${info.envelope.to}`,
  });
});

//Login User
const loginUser = asyncWrapper(async (req, res, next) => {
  // grab email and password from req.body
  const { email, password } = req.body;

  if (!email) {
    throw customError(400, "Please provide an email");
  }
  if (!password) {
    throw customError(400, "Please provide a password");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw customError(401, "No User with this Email");
  }

  const isPasswordCorrect = await user.comparePassword(password);


  if (!isPasswordCorrect) {
    throw customError(401, "Unauthorized");
  }

  const userProfile = await UserProfile.findOne({ userId: user._id });

  // Checks if user email has been verified
  if (!userProfile.isVerified) {
    throw customError(401, "Email not verified!");
  }

  // Update lastActivityTimestamp in the userProfile document
  userProfile.lastActivityTimestamp = new Date(); // Set current date and time
  await userProfile.save(); // Save the updated userProfile document

  //generate new token
  const token = generateToken(user._id);

  res.status(200).json({
    id: user._id,
    token,
    role: user.role,
    image: userProfile.image,
    userProfileId: userProfile._id,
  });
});

//GET USER
const getUser = asyncWrapper(async (req, res) => {
  const { userId } = req.user;

  // Retrieve user profile with populated user information excluding certain fields
  const userProfile = await UserProfile.findOne({ userId }).populate({
    path: "userId",
    model: "User",
    select: "-password -phoneNumber -role",
  });

  if (!userProfile) {
    throw customError(404, "User profile not found");
  }

  res.status(200).json({
    userProfile,
    // Include other fields from userProfile as needed
  });
});

//UPDATE USER
const updateUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { password, ...userDetails } = req.body;

  // await userService.validatePassword(userId, password);

  const updatedProfileInfo = {};

  const profileFields = [
    "location",
    "height",
    "about",
    "profession",
    "interest",
    "birthday",
    "gender",
    "jobTitle",
  ];

  profileFields.forEach((field) => {
    if (field === "interest" && typeof userDetails[field] === "string") {
      updatedProfileInfo["$addToSet"] = {
        [field]: {
          ["$each"]: userDetails[field]
            .split(",")
            .map((eachInterest) => eachInterest.toLowerCase().trim()),
        },
      };
    } else {
      updatedProfileInfo[field] = userDetails[field];
    }
  });

  if (req.files && req.files.image) {
    updatedProfileInfo.image = await uploadService.uploadUserImage(
      req.files.image.tempFilePath
    );
  }

  if (req.files) {
    const photos = ["photo1", "photo2", "photo3", "photo4", "photo5", "photo6"];

    const images = photos
      .filter((photo) => req.files[photo])
      .map((photo) => req.files[photo]);

    updatedProfileInfo.photos = images;

    if (images.length > 0) {
      updatedProfileInfo.photos = await uploadService.uploadUserPhotos(
        Object.values(images)
      );
    }
  }

  const updatedUserInfo = {
    firstName: userDetails.firstName,
    lastName: userDetails.lastName,
    email: userDetails.email,
    phoneNumber: userDetails.phoneNumber,
  };

  let data2 = await userService.updateUserProfile(userId, updatedProfileInfo);
  await userService.updateUserModel(userId, updatedUserInfo);

  return res
    .status(200)
    .json({ message: "Details Updated Successfully!", data2 });
});

const sendOTP = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw customError(400, "Please provide an email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw customError(401, "No User with this Email");
  }

  const otp = generateOTP();

  const subject = "Here is your OTP";
  const text = `Please use this otp to verify your account. OTP: ${otp}`;
  const intro =
    "You received this email because you requested for an OTP on Duduconnect";

  const { emailBody, emailText } = generateEmail(intro, user.firstName, otp);

  const info = await sendEmail({
    to: email,
    subject,
    text,
    text: emailText,
    html: emailBody,
  });
  const result = await OTP.create({ email, otp });

  res.status(201).json({
    message: `OTP has been sent to ${info.envelope.to}`,
  });
});

const verifyOTP = asyncWrapper(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email) {
    throw customError(400, "Please provide an email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw customError(401, "No User with this Email");
  }

  const otpBody = await OTP.findOne({ email, otp });

  if (!otpBody) {
    throw customError(400, "Invalid or Expired OTP");
  }

  const userProfile = await UserProfile.findOneAndUpdate(
    { userId: user._id },
    { isVerified: true }
  );

  res.status(200).json({ message: "Profile Verified" });
});

const forgotPassword = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw customError(400, "Please provide an email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw customError(401, "No User with this Email");
  }

  const otp = generateOTP();

  const subject = "Here is your OTP";
  const text = `Please use this otp to reset your password. OTP: ${otp}`;

  const info = await sendEmail({ to: email, subject, text });
  const result = await OTP.create({ email, otp });

  res.status(201).json({
    message: `OTP has been sent to ${info.envelope.to}`,
  });
});

const resetPassword = asyncWrapper(async (req, res, next) => {
  const { email, otp, password } = req.body;

  if (!email) {
    throw customError(400, "Please provide an email");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw customError(400, "No User with this Email");
  }

  const otpBody = await OTP.findOne({ email, otp });

  if (!otpBody) {
    throw customError(400, "Invalid or Expired OTP");
  }

  user.password = password;
  await user.save();
  await OTP.findOneAndDelete({ email, otp });
  res.status(200).json({ message: "Password Updated!" });
});

module.exports = {
  registerUser,
  loginUser,
  getUser,
  updateUser,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
};
