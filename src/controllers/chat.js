const Chat = require("../models/chat");

const startChat = async (req, res) => {
  const { firstId, secondId } = req.body;

  try {
    const chat = await Chat.findOne({
      members: { $all: [firstId, secondId] },
    });

    if (!chat) {
      const newChat = await Chat.create({ members: [firstId, secondId] });
      return res.status(200).json({ chat: newChat });
    }

    return res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// ========================================

const findUserChats = async (req, res) => {
  const { userId } = req.params;

  try {
    const chat = await Chat.find({
      members: { $in: [userId] },
    });

    return res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// ========================================

const findChat = async (req, res) => {
  const { firstId, secondId } = req.params;

  try {
    const chat = await Chat.find({
      members: { $all: [firstId, secondId] },
    });

    return res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = { startChat, findUserChats, findChat };
