const errorMiddleware = (err, req, res, next) => {
  let statusCode =
    err.statusCode || (res.statusCode == 200 ? 500 : res.statusCode);
  let errorMessage =
    err.message || "Something went wrong, please try again later";

  if (err.errors?.email) {
    errorMessage = err.errors.email.message;
    statusCode = 400;
  } else if (err.errors?.message) {
    errorMessage = err.errors.username.message;
    statusCode = 400;
  } else if (err.errors?.phoneNumber) {
    errorMessage = err.errors.phoneNumber.message;
    statusCode = 400;
  }

  if (err.code === 11000 && err.keyValue.email) {
    errorMessage = `User with this email already exists`;
    statusCode = 400;
  }
  if (err.code === 11000 && err.keyValue.phoneNumber) {
    errorMessage = `User with this phone number already exists`;
    statusCode = 400;
  }

  // console.error(err);

  console.error(err.message); // Logging the error for debugging

  res.status(statusCode).json({ message: errorMessage });
};

module.exports = errorMiddleware;
