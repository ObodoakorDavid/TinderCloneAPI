const starService = require("../services/starService");

const getUserStars = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const result = await starService.getUserStars(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const starUser = async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const result = await starService.starUser(userId, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const unStarUser = async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const result = await starService.unStarUser(userId, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  starUser,
  unStarUser,
  getUserStars,
};
