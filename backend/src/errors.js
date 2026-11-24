class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "Ezzel az e-mail-címmel már regisztráltak." });
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).json({
    message: status >= 500 ? "Váratlan szerverhiba történt." : error.message,
  });
}

module.exports = { HttpError, asyncHandler, errorHandler };
