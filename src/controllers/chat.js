const Chat = require("../models/chat");

const startChat = async (req, res) => {
  const { firstId, secondId } = req.body;

  try {
    const chat = await Chat.findOne({
      members: { $all: [firstId, secondId] },
    });

    if (!chat) {
      const newChat = await Chat.create({ members: [firstId, secondId] });
      return res.status(200).json({ message: "Chat Created!", chat: newChat });
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
    const chats = await Chat.find({
      members: { $in: [userId] },
    });

    return res.status(200).json({ chats });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// ========================================

const findChat = async (req, res) => {
  const { chatId } = req.params;
  console.log(chatId);

  try {
    const chat = await Chat.findOne({
      _id: chatId,
    });

    if (!chat) {
      return res.status(404).json({ message: "No chat found!" });
    }

    return res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = { startChat, findUserChats, findChat };
