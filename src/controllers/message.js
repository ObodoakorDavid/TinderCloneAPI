const Chat = require("../models/chat");
const Message = require("../models/message");

// createMessage
const createMessage = async (req, res) => {
  const { text } = req.body;
  const { userId } = req.user;
  const { recepientId } = req.params;

  try {
    const message = await Message.create({ sentBy: userId, text });
    const chat = await Chat.findOneAndUpdate(
      {
        members: { $all: [userId, recepientId] },
      },
      { $push: { messages: message._id } }
    );

    if (!chat) {
      const chat = await Chat.create({
        members: [userId, recepientId],
        messages: message._id,
      });
      return res.status(200).json({ message: "Chat Sent" });
    }

    return res.status(200).json({ message: "Chat Sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// getMessages

const getMessages = async (req, res) => {
  const { userId } = req.user;
  const { recepientId } = req.params;

  try {
    const chats = await Chat.findOne({
      members: { $all: [userId, recepientId] },
    })
      .select("messages")
      .sort({ "messages.createdAt": -1 })
      .populate({
        path: "messages",
        select: "-__v -updatedAt",
      });

    if (!chats) {
      return res.status(404).json({ message: "No chat with User" });
    }

    return res.status(200).json({ messages: chats.messages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

module.exports = { createMessage, getMessages };
