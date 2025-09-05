exports.errorHandler = (name, message, code) => {
  const err = new Error(message);
  err.statusCode = code;
  err.name = name;
  throw err;
};

exports.sendError = (error, res) => {
  const statusCode = error?.statusCode ?? 500;
  const message = error?.message ?? "En error has occurred";
  const name = error?.name ?? "Error";
  return res.status(statusCode).json({ success: false, message, name });
};
