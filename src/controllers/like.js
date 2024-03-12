const likeService = require("../services/likeService");

// Getting a User Likes
const getUserLikes = async (req, res) => {
  const { userId } = req.user;

  try {
    const likes = await likeService.getUserLikes(userId);
    return res.status(200).json({ likes });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

// Liking a User
const likeUser = async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const result = await likeService.likeUser(userId, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

//Unlikng a user
const unLikeUser = async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const result = await likeService.unlikeUser(userId, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserLikes,
  likeUser,
  unLikeUser,
};
