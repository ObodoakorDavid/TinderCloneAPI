const asyncWrapper = require("../middlewares/asyncWrapper");
const starService = require("../services/starService");

const getUserStars = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const result = await starService.getUserStars(userId);
  res.status(200).json(result);
});

const starUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await starService.starUser(userId, id);
  res.status(200).json(result);
});

const unStarUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await starService.unStarUser(userId, id);
  res.status(200).json(result);
});

module.exports = {
  starUser,
  unStarUser,
  getUserStars,
};
