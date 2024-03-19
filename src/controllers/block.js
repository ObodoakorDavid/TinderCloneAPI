const blockService = require("../services/blockService");

// Getting a User Blocks
const getUserBlocks = async (req, res) => {
  const { userId } = req.user;

  try {
    const blocks = await blockService.getUserBlocks(userId);
    res.status(200).json({ blocks });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Blocking a User
const blockUser = async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const result = await blockService.blockUser(userId, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Unblocking a user
const unBlockUser = async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const result = await blockService.unblockUser(userId, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserBlocks,
  blockUser,
  unBlockUser,
};
