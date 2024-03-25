const asyncWrapper = require("../middlewares/asyncWrapper");
const blockService = require("../services/blockService");

// Getting a User Blocks
const getUserBlocks = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const blocks = await blockService.getUserBlocks(userId);
  res.status(200).json({ blocks });
});

// Blocking a User
const blockUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await blockService.blockUser(userId, id);
  res.status(200).json(result);
});

// Unblocking a user
const unBlockUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;
  const result = await blockService.unblockUser(userId, id);
  res.status(200).json(result);
});

module.exports = {
  getUserBlocks,
  blockUser,
  unBlockUser,
};
