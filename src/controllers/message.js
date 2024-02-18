const Message = require("../models/message");

// createMessage
const createMessage = async (req, res) => {
  const { senderId, text } = req.body;

  try {
    const message = await Message.create({
      senderId,
      text,
    });

    return res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// getMessages

const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({
      chatId,
    });

    return res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = { createMessage, getMessages };
