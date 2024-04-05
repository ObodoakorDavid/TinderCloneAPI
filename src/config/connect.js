const mongoose = require("mongoose");

const connectDB = (url) => {
  return mongoose.connect(url, { dbName: "Dating-App" });
};

module.exports = connectDB;
