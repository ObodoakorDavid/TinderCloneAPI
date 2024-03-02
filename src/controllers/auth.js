const User = require("../models/user");
const UserProfile = require("../models/userProfile");
const customError = require("../utils/customError");
const sendEmail = require("../utils/sendEmail");
const OTP = require("../models/otp");
const generateOTP = require("../utils/generateOTP");
const cloudinary = require("../utils/cloudinaryConfig");
const generateEmail = require("../utils/generateEmail");

const registerUser = async (req, res, next) => {
  //grab email, password from req.body
  const { email, password, firstName, lastName, phoneNumber } = req.body;
  if (!email || !password || !firstName || !lastName || !phoneNumber) {
    return next(customError(400, "Please provide all fields"));
  }

  try {
    // create new user on the DB
    const user = await User.create({ ...req.body });
    const userProfile = await UserProfile.create({ userId: user._id });

    // generate new token
    // const token = userProfile.createJWT();

    //generating OTP
    const otp = generateOTP();

    // Sending OTP
    const subject = "OTP Request";
    const intro =
      "You received this email because you registered on Duduconnect";

    const { emailBody, emailText } = generateEmail(intro, user.firstName, otp);

    const info = await sendEmail({
      to: "davidtumuch@gmail.com",
      subject,
      text: emailText,
      html: emailBody,
    });

    const result = await OTP.create({ email, otp });

    res.status(201).json({
      message: `OTP has been sent to ${info.envelope.to}`,
    });
  } catch (error) {
    return next(error);
  }
};

//Login User
const loginUser = async (req, res, next) => {
  // grab email and password from req.body
  const { email, password } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }
  if (!password) {
    return next(customError(400, "Please provide a password"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(customError(401, "No User with this Email"));
  }

  const isPasswordCorrect = await user.comparePassword(password);

  console.log(user);

  if (!isPasswordCorrect) {
    return next(customError(401, "Unauthorized"));
  }

  const userProfile = await UserProfile.findOne({ userId: user._id });

  // Checks if user email has been verified
  if (!userProfile.isVerified) {
    return res.status(401).json({ message: "Email not verified!" });
  }

  //generate new token
  const token = userProfile.createJWT();

  res
    .status(200)
    .json({ id: userProfile._id, token, image: userProfile.image });
};

//GET USER
const getUser = async (req, res) => {
  const { userId } = req.user;
  const userProfile = await UserProfile.findOne({ _id: userId });

  res.status(200).json({
    id: userProfile._id,
    image: userProfile.image,
  });
};

const getAllUsers = async (req, res) => {
  const users = await UserProfile.find(
    {},
    { __v: 0, createdAt: 0, updatedAt: 0, isVerified: 0, userId: 0 }
  );
  res.status(200).json({ users });
};

//UPDATE USER
const updateUser = async (req, res, next) => {
  //get userId from auth middleware
  const { userId } = req.user;
  const { password } = req.body;
  if (!password) {
    return next(customError(401, "Please provide password"));
  }

  const userProfile = await UserProfile.findOne({ _id: userId });

  const user = await User.findOne({ _id: userProfile.userId });
  // check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return next(customError(401, "Unauthorized"));
  }

  //grab password and image from incoming request body
  const { username, profession, location, about, interest, height, gender } =
    req.body;

  const updatedDetails = {};

  if (username) {
    updatedDetails.username = username;
  }
  if (profession) {
    updatedDetails.profession = profession;
  }
  if (location) {
    updatedDetails.location = location;
  }
  if (about) {
    updatedDetails.about = about;
  }
  if (height) {
    updatedDetails.height = height;
  }
  if (gender) {
    updatedDetails.gender = gender;
  }
  if (interest) {
    updatedDetails["$push"] = { interest: interest };
  }

  if (req.files && req.files.photos) {
    const uploadedUrls = [];

    // Upload each file to Cloudinary
    const uploadPromises = Object.values(req.files.photos).map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          file.tempFilePath,
          {
            use_filename: true,
            folder: "dating-app",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              uploadedUrls.push(result.secure_url);
              resolve();
            }
          }
        );
      });
    });

    await Promise.all(uploadPromises);
    updatedDetails["$push"] = { photos: uploadedUrls };
  }

  // grabbing user info
  const { firstName, lastName, email, phoneNumber } = req.body;
  const updatedUserInfo = {};

  if (firstName) {
    updatedUserInfo.firstName = firstName;
  }
  if (lastName) {
    updatedUserInfo.lastName = lastName;
  }
  if (email) {
    updatedUserInfo.email = email;
  }
  if (phoneNumber) {
    updatedUserInfo.phoneNumber = phoneNumber;
  }

  try {
    // updating userProfile model
    await UserProfile.findOneAndUpdate(
      { _id: userId },
      {
        ...updatedDetails,
      }
    );

    //updating user model
    await User.findOneAndUpdate(
      { _id: userProfile.userId },
      {
        ...updatedUserInfo,
      }
    );

    return res.status(200).json({ message: "Details Updated Sucessfully!" });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const sendOTP = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(customError(401, "No User with this Email"));
  }

  const otp = generateOTP();

  const subject = "Here is your OTP";
  const text = `Please use this otp to verify your account. OTP: ${otp}`;

  try {
    const info = await sendEmail({ to: email, subject, text });
    const result = await OTP.create({ email, otp });

    res.status(201).json({
      message: `OTP has been sent to ${info.envelope.to}`,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(customError(401, "No User with this Email"));
  }

  const otpBody = await OTP.findOne({ email, otp });

  if (!otpBody) {
    return res.status(400).json({ message: "Invalid or Expired OTP" });
  }

  const userProfile = await UserProfile.findOneAndUpdate(
    { userId: user._id },
    { isVerified: true }
  );

  try {
    res.status(200).json({ message: "Profile Verified" });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(customError(401, "No User with this Email"));
  }

  const otp = generateOTP();

  const subject = "Here is your OTP";
  const text = `Please use this otp to reset your password. OTP: ${otp}`;

  try {
    const info = await sendEmail({ to: email, subject, text });
    const result = await OTP.create({ email, otp });

    res.status(201).json({
      message: `OTP has been sent to ${info.envelope.to}`,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email) {
    return next(customError(400, "Please provide an email"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(customError(401, "No User with this Email"));
  }

  const otpBody = await OTP.findOne({ email, otp });

  if (!otpBody) {
    return res.status(400).json({ message: "Invalid or Expired OTP" });
  }

  try {
    user.password = password;
    await user.save();
    await OTP.findOneAndDelete({ email, otp });
    res.status(200).json({ message: "Password Updated!" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  updateUser,
  sendOTP,
  verifyOTP,
  getAllUsers,
  forgotPassword,
  resetPassword,
};
