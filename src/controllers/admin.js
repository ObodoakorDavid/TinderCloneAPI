const asyncWrapper = require("../middlewares/asyncWrapper");
const AdminService = require("../services/adminService");

const getAllUsers = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const users = await AdminService.getAllUsers(userId);
  res.status(200).json({ users });
});

const getSuspendedUsers = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const users = await AdminService.getSuspendedUsers(userId);
  res.status(200).json({ users });
});

const suspendUser = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const result = await AdminService.suspendUser(userId);
  res.status(200).json(result);
});

const unSuspendUser = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const result = await AdminService.unSuspendUser(userId);
  res.status(200).json(result);
});

const getAllMatches = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const result = await AdminService.getAllMatches(userId);
  res.status(200).json(result);
});

module.exports = {
  getAllUsers,
  getSuspendedUsers,
  suspendUser,
  unSuspendUser,
  getAllMatches,
};
