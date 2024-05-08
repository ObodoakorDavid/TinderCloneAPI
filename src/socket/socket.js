const { Server } = require("socket.io");

let onlineUsers = [];

const handleNewUser = (io, socket, data) => {
  if (!onlineUsers.some((user) => user.userProfileId === data.userProfileId)) {
    onlineUsers.push({
      userId: data.userId,
      userProfileId: data.userProfileId,
      socketId: socket.id,
    });
  }

  io.emit("getOnlineUsers", onlineUsers);
};

const handleMessage = (io, socket, data) => {
  const user = onlineUsers.find(
    (user) => user.userProfileId === data.recipientId
  );
  if (user) {
    io.to(user.socketId).to(socket.id).emit("getMessage", data);
  }
};

const handleIsTyping = (io, socket, data) => {
  const user = onlineUsers.find(
    (user) => user.userProfileId === data.recipientId
  );
  if (user) {
    io.to(user.socketId).to(socket.id).emit("isTyping", data);
  }
};

const handleDisconnect = (io, socket) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
  io.emit("getOnlineUsers", onlineUsers);
};

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Web Socket is Up and Running!");
    console.log(`User's Socket ID: ${socket.id}`);

    socket.on("addNewUser", (data) => handleNewUser(io, socket, data));

    socket.on("sendMessage", (data) => handleMessage(io, socket, data));

    socket.on("isTyping", (data) => handleIsTyping(io, socket, data));

    socket.on("disconnect", () => handleDisconnect(io, socket));
  });

  return io;
};

module.exports = initializeSocket;
