class ApiError extends Error {
  constructor(statusCode, message, code = null, errors = [], stack = "") {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;

