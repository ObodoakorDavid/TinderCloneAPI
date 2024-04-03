const UserProfile = require("../models/userProfile");
const blockService = require("./blockService");
const customError = require("../utils/customError");
const validateMongoId = require("../utils/validateMongoId");

const excludedFields = {
  password: 0,
  role: 0,
  isVerified: 0,
  createdAt: 0,
  updatedAt: 0,
  ["__v"]: 0,
  liked: 0,
  disLiked: 0,
  starred: 0,
  blocked: 0,
};

async function getAllUsers(userId) {
  // Get All of the users the user has blocked
  const blockedUsers = await blockService.getUserBlocks(userId);
  const blockedUsersIds = blockedUsers.map((user) => user.userId._id);

  const users = await UserProfile.find({ userId: { $nin: blockedUsersIds } })
    .populate({
      path: "userId",
      select: ["firstName", "lastName", "email"],
    })
    .select({
      isVerified: 0,
      createdAt: 0,
      updatedAt: 0,
      ["__v"]: 0,
      starred: 0,
    });
  return users;
}

async function getSingleUser(userId) {
  if (!validateMongoId(userId)) {
    throw customError(400, "ID Invalid");
  }

  const user = await UserProfile.findOne({ userId })
    .populate({
      path: "userId",
      select: ["firstName", "lastName"],
    })
    .select({
      isVerified: 0,
      createdAt: 0,
      updatedAt: 0,
      ["__v"]: 0,
      liked: 0,
      starred: 0,
    });

  if (!user) {
    throw customError(404, `No User with ID:${userId}`);
  }
  return user;
}

async function getAllMatches(userId, query) {
  // Validate input parameters
  if (!userId || typeof userId !== "string") {
    throw customError(400, "Invalid userId");
  }
  // if (!query || typeof query !== "object") {
  //   throw customError(400, "Invalid query object");
  // }

  const { numOfPhotos, gender, interest } = query;

  // Get All of the users the user has blocked
  const blockedUsers = await blockService.getUserBlocks(userId);
  const blockedUsersIds = blockedUsers.map((user) => user.userId._id);

  // Define the aggregation pipeline
  const pipeline = [];

  // Stage 1: Match users based on query criteria
  const matchStage = {
    $match: {
      userId: { $nin: [userId, ...blockedUsersIds] },
    },
  };
  if (gender) {
    matchStage.$match.gender = gender;
  }
  if (interest) {
    matchStage.$match.interest = { $in: interest.toLowerCase().split(",") };
  }
  pipeline.push(matchStage);

  // Stage 2: Sample random documents
  pipeline.push({ $sample: { size: 200 } }); // Adjust size as needed

  pipeline.push({
    $lookup: {
      from: "users", // The name of the collection to join with
      localField: "userId", // The field from the input documents
      foreignField: "_id", // The field from the documents of the "from" collection
      as: "userId", // The alias for the resulting array
    },
  });

  pipeline.push({
    $addFields: {
      userId: { $arrayElemAt: ["$userId", 0] },
    },
  });

  pipeline.push({ $project: excludedFields });
  pipeline.push({ $project: { userId: excludedFields } });
  // Execute the aggregation pipeline
  let users = await UserProfile.aggregate(pipeline).exec();

  // Filter users by the number of photos if specified
  if (numOfPhotos) {
    users = users.filter((user) => user.photos.length >= Number(numOfPhotos));
  }

  return users;
}

module.exports = { getAllUsers, getSingleUser, getAllMatches };
