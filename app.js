require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");

const connectDB = require("./src/db/connect");
const socketInitializer = require("./src/socket/socket");

// Middlewares
const notFound = require("./src/middlewares/notFound");
const error = require("./src/middlewares/error");

// Routes
const authRouter = require("./src/routes/auth");
const likeRouter = require("./src/routes/like");
const starRouter = require("./src/routes/star");
const adminRouter = require("./src/routes/admin");
const chatRouter = require("./src/routes/chat");
const userRouter = require("./src/routes/user");
const blockRouter = require("./src/routes/block");

//
const app = express();
const httpServer = require("http").Server(app);
const io = socketInitializer(httpServer);
const port = process.env.PORT || 4000;

app.use(cors());
// app.use(helmet());
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
// Loggin
if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}
app.use("/api/auth", authRouter);
app.use("/api/like", likeRouter);
app.use("/api/star", starRouter);
app.use("/api/block", blockRouter);
app.use("/api/users", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(error);

const start = async () => {
  try {
    await connectDB(process.env.DB_URI);
    console.log(`DB Connected!`);
    httpServer.listen(port, console.log(`Server is listening at PORT:${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
