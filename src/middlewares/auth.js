const jwt = require("jsonwebtoken");
const customError = require("../utils/customError");
const User = require("../models/users");
const UserProfile = require("../models/userProfile");
const asyncWrapper = require("./asyncWrapper");

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log(req.headers);
  // console.log(authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(customError(401, "No Token Provided"));
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, username: payload.username };
    next();
  } catch (error) {
    console.log(error.message);
    if (error.message === "jwt expired") {
      return next(customError(401, "Token Expired"));
    }
    return next(customError(401, "Invalid Token"));
  }
};

const isAdmin = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const user = await User.findById(userId);

  if (!user || user.role !== "admin") {
    return next(customError(401, "Unauthorized"));
  }

  next();
});

module.exports = { auth, isAdmin };
