const asyncWrapper = require("../middlewares/asyncWrapper");
const chatService = require("../services/chatService");

// Start a Chat
const startChat = asyncWrapper(async (req, res, next) => {
  const participants = req.body.participants;
  const newChat = await chatService.startChat(participants);
  res.status(201).json({ chat: newChat });
});

// Add Message To Chat
const addMessageToChat = asyncWrapper(async (req, res, next) => {
  const { chatId } = req.params;
  const { text } = req.body;
  const { userId: sender } = req.user;
  const newMessage = await chatService.addMessageToChat(chatId, sender, text);
  res.status(201).json({ message: newMessage });
});

// Get User's Chats
const getUserChats = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const userChats = await chatService.getUserChats(userId);
  res.status(200).json({ chats: userChats });
});

// Get Messages In A Chat
const getChatMessages = asyncWrapper(async (req, res, next) => {
  const { chatId } = req.params;
  const chat = await chatService.getChatMessages(chatId);
  res.status(200).json({ chat });
});

module.exports = {
  startChat,
  addMessageToChat,
  getUserChats,
  getChatMessages,
};
