const { Server } = require("socket.io");
const io = new Server({
  cors: {
    origin: "*",
  },
});

let onlineUsers = [];

const onConnect = (socket) => {
  console.log("Web Socket is Up and Running!");
  console.log(socket.id);

  socket.on("addNewUser", (userId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });

    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("sendMessage", (data) => {
    const user = onlineUsers.find((user) => user.userId === data.recipientId);
    console.log(user);
    if (user) {
      io.to(user.socketId).to(socket.id).emit("getMessage", data.message);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

    io.emit("getOnlineUsers", onlineUsers);
  });
};

io.on("connection", onConnect);

module.exports = io;
