const Chat = require("../models/chat");
const Message = require("../models/message");
const UserProfile = require("../models/userProfile");
const validateMongoId = require("../utils/validateMongoId");

exports.startChat = async (participants) => {
  try {
    if (
      !validateMongoId(participants[0]) ||
      !validateMongoId(participants[1])
    ) {
      throw new Error("Participants Id Not Valid");
    }

    const userProfile1 = await UserProfile.findOne({ userId: participants[0] });
    const userProfile2 = await UserProfile.findOne({ userId: participants[1] });

    const existingChat = await Chat.findOne({
      members: { $all: [userProfile1._id, userProfile2._id] },
    });

    if (existingChat) {
      return existingChat;
    }
    const newChat = await Chat.create({
      members: [userProfile1._id, userProfile2._id],
      messages: [], // Initially, the chat may not have any messages
    });

    return newChat;
  } catch (error) {
    throw new Error("Error creating chat: " + error.message);
  }
};

exports.addMessageToChat = async (chatId, senderId, text) => {
  if (!validateMongoId(chatId)) {
    throw new Error(`${chatId} is not a valid ID`);
  }

  try {
    const userProfile = await UserProfile.findOne({ userId: senderId });

    const newMessage = await Message.create({
      sender: userProfile._id, // Assuming sender is the user who sent the message
      text: text,
    });

    // Query for the new message and populate the 'sender' field
    const populatedMessage = await Message.findById(newMessage._id).populate({
      path: "sender",
      select: "firstName lastName",
    });

    // Add the new message reference to the chat
    await Chat.findByIdAndUpdate(
      chatId,
      { $push: { messages: populatedMessage._id } },
      { new: true }
    );
    return populatedMessage;
  } catch (error) {
    throw new Error("Error adding message to chat: " + error.message);
  }
};

exports.getUserChats = async (userId) => {
  try {
    const userProfile = await UserProfile.findOne({ userId: userId });

    const userChats = await Chat.find({ members: { $in: [userProfile._id] } })
      .select("_id members messages")
      .populate({
        path: "members",
        select: "image",
        populate: {
          path: "userId",
          select: "firstName lastName",
        },
      })
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 }, limit: 1 },
        populate: {
          path: "sender",
          select: "userId image",
          populate: {
            path: "userId",
            select: "firstName lastName",
          },
        },
      });
    // return userChats;
    // console.log(userChats);

    const chatsWithLastMessage = userChats.map((chat) => {
      const lastMessage = chat.messages.length > 0 ? chat.messages[0] : null;

      let otherUser = chat.members.find(
        (member) => member._id.toString() !== userId.toString()
      );

      // console.log(lastMessage);
      console.log(otherUser);

      return {
        chatId: chat._id,
        lastMessage: lastMessage
          ? {
              text: lastMessage.text,
              sender: lastMessage.sender.userId.firstName,
              createdAt: lastMessage.createdAt,
            }
          : null,
        otherUser: otherUser || null,
      };
    });

    return chatsWithLastMessage;
  } catch (error) {
    throw new Error("Error retrieving user chats: " + error.message);
  }
};

exports.getChatMessages = async (chatId) => {
  if (!validateMongoId(chatId)) {
    const error = new Error(`${chatId} is not a valid ID`);
    error.statusCode = 400;
    throw error;
  }
  try {
    const chat = await Chat.findById(chatId)
      .populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "userId",
          populate: {
            path: "userId",
            select: "firstName",
          },
        },
      })
      .sort({ createdAt: -1 });
    if (!chat) {
      throw new Error("Chat not found");
    }

    return chat;
  } catch (error) {
    throw new Error("Error retrieving chat messages: " + error.message);
  }
};
