const asyncWrapper = require("../middlewares/asyncWrapper");
const dislikeService = require("../services/dislikeService");

// Getting a User Dislikes
const getUserDislikes = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const dislikes = await dislikeService.getUserDislikes(userId);
  return res.status(200).json({ dislikes });
});

// Disliking a User
const dislikeUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await dislikeService.dislikeUser(userId, id);
  res.status(200).json(result);
});

// Undisliking a user
const undislikeUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await dislikeService.undislikeUser(userId, id);
  res.status(200).json(result);
});

module.exports = {
  getUserDislikes,
  dislikeUser,
  undislikeUser,
};
