const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err.message || err);

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  if (err.code) {
    response.code = err.code;
  }

  if (err.code === "INTERVIEW_LIMIT_REACHED" || err.statusCode === 403) {
    response.upgradeRequired = true;
  }

  if (process.env.NODE_ENV === "development" && !err.code) {
    response.error = err;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;

