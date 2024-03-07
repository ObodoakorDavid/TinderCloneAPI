const Chat = require("../models/chat");
const Message = require("../models/message");
const validateMongoId = require("../utils/validateMongoId");

exports.startChat = async (participants) => {
  try {
    if (
      !validateMongoId(participants[0]) ||
      !validateMongoId(participants[1])
    ) {
      throw new Error("Participants Id Not Valid");
    }
    const newChat = await Chat.create({
      members: participants,
      messages: [], // Initially, the chat may not have any messages
    });

    return newChat;
  } catch (error) {
    throw new Error("Error creating chat: " + error.message);
  }
};

exports.addMessageToChat = async (chatId, sender, text) => {
  try {
    const newMessage = await Message.create({
      sender: sender, // Assuming sender is the user who sent the message
      text: text,
    });

    // Add the new message reference to the chat
    await Chat.findByIdAndUpdate(
      chatId,
      { $push: { messages: newMessage._id } },
      { new: true }
    );

    return newMessage;
  } catch (error) {
    throw new Error("Error adding message to chat: " + error.message);
  }
};

exports.getUserChats = async (userId) => {
  try {
    const userChats = await Chat.find({ members: { $in: [userId] } }).populate({
      path: "messages",
      options: { sort: { createdAt: -1 }, limit: 1 },
      populate: {
        path: "sender",
        select: "sender",
        populate: { path: "userId", select: "firstName" },
      },
    });

    const chatsWithLastMessage = userChats.map((chat) => {
      const lastMessage = chat.messages.length > 0 ? chat.messages[0] : null;

      return {
        chatId: chat._id,
        // participants: chat.members,
        lastMessage: lastMessage
          ? {
              text: lastMessage.text,
              sender: lastMessage.sender.userId.firstName,
              createdAt: lastMessage.createdAt,
            }
          : null,
      };
    });

    return chatsWithLastMessage;
  } catch (error) {
    throw new Error("Error retrieving user chats: " + error.message);
  }
};

exports.getChatMessages = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId)
      .populate("messages")
      .sort({ createdAt: -1 });
    if (!chat) {
      throw new Error("Chat not found");
    }

    return chat.messages;
  } catch (error) {
    throw new Error("Error retrieving chat messages: " + error.message);
  }
};
