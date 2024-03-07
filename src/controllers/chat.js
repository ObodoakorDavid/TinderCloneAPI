const chatService = require("../services/chatService");

const startChat = async (req, res, next) => {
  try {
    const participants = req.body.participants; // Adjust based on your request body
    const newChat = await chatService.startChat(participants);
    res.status(201).json({ chat: newChat });
  } catch (error) {
    next(error);
  }
};

// ================================

const addMessageToChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { sender, text } = req.body; // Adjust based on your request body
    const newMessage = await chatService.addMessageToChat(chatId, sender, text);
    res.status(201).json({ message: newMessage });
  } catch (error) {
    next(error);
  }
};

// ===================================

const getUserChats = async (req, res, next) => {
  try {
    const { userId } = req.user;
    console.log(userId);
    // const { userId } = req.params;
    const userChats = await chatService.getUserChats(userId);
    res.status(200).json({ chats: userChats });
  } catch (error) {
    next(error);
  }
};

// =======================================

const getChatMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const messages = await chatService.getChatMessages(chatId);
    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startChat,
  addMessageToChat,
  getUserChats,
  getChatMessages,
};
