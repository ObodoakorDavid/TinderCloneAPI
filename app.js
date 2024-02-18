require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const connectDB = require("./src/db/connect");

// Middlewares
const notFound = require("./src/middlewares/notFound");
const error = require("./src/middlewares/error");

// Routes
const authRouter = require("./src/routes/auth");
const likeRouter = require("./src/routes/like");
const starRouter = require("./src/routes/star");
const adminRouter = require("./src/routes/admin");
const chatRouter = require("./src/routes/chat");
const messageRouter = require("./src/routes/message");
const io = require("./src/socket/socket");

const app = express();

const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
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
app.use("/api/admin", adminRouter);
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

app.use(notFound);
app.use(error);

const start = async () => {
  try {
    await connectDB(process.env.DB_URI);
    console.log(`DB Connected!`);
    io.listen(5000, console.log(`Socket Live at PORT 5000`));
    app.listen(port, console.log(`Server is listening at PORT:${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
