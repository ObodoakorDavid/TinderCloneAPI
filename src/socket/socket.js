const { Server } = require("socket.io");

let onlineUsers = [];

const handleNewUser = (io, socket, userId) => {
  if (!onlineUsers.some((user) => user.userId === userId)) {
    onlineUsers.push({
      userId,
      socketId: socket.id,
    });
  }

  io.emit("getOnlineUsers", onlineUsers);
};

const handleMessage = (io, socket, data) => {
  const user = onlineUsers.find((user) => user.userId === data.recipientId);
  if (user) {
    io.to(user.socketId).to(socket.id).emit("getMessage", data);
  }
};

// const handleUpdateChat = (io, socket, data) => {
//   const user = onlineUsers.find((user) => user.userId === data.recipientId);
//   if (user) {
//     io.to(user.socketId).to(socket.id).emit("getMessage", data);
//   }
// };

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
    console.log(socket.id);

    socket.on("addNewUser", (userId) => handleNewUser(io, socket, userId));

    socket.on("sendMessage", (data) => handleMessage(io, socket, data));

    // socket.on("updateChat", (data) => handleUpdateChat(io, socket, data));

    socket.on("disconnect", () => handleDisconnect(io, socket));
  });

  return io;
};

module.exports = initializeSocket;
