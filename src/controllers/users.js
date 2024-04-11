const customError = require("../utils/customError");
const usersService = require("../services/usersService");
const asyncWrapper = require("../middlewares/asyncWrapper");

const getAllUsers = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const users = await usersService.getAllUsers(userId);
  res.status(200).json({ users });
});

const getSingleUser = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const user = await usersService.getSingleUser(id);
  res.status(200).json({ user });
});

const getAllMatches = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const users = await usersService.getAllMatches(userId, req.query);
  res.status(200).json({ users });
});

module.exports = {
  getAllUsers,
  getSingleUser,
  getAllMatches,
};
