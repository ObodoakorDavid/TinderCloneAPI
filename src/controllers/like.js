const asyncWrapper = require("../middlewares/asyncWrapper");
const likeService = require("../services/likeService");

// Getting a User Likes
const getUserLikes = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const likes = await likeService.getUserLikes(userId);
  return res.status(200).json({ likes });
});

// Liking a User
const likeUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await likeService.likeUser(userId, id);
  res.status(200).json(result);
});

//Unlikng a user
const unLikeUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await likeService.unlikeUser(userId, id);
  res.status(200).json(result);
});

module.exports = {
  getUserLikes,
  likeUser,
  unLikeUser,
};
