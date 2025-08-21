
const capitalizeWords = (str) => {
  if (!str) return str;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};





const ApiResponse = (statusCode, message = "Success", data = null, meta = null) => {
  return {
    statusCode,
    success: statusCode < 400,
    message: capitalizeWords(message),
    data,
    ...(meta && { meta }),
    timestamp: new Date(),
  };
};


const responseMiddleware = (req, res, next) => {
  res.api = (statusCode, message = "Success", data = null, meta = null) => {
    if (typeof message === "object" && message !== null && !Array.isArray(message)) {
      data = message;
      message = "Success";
    }
    return res.status(statusCode).json(ApiResponse(statusCode, message, data, meta));
  };
  next();
};

export { ApiResponse, responseMiddleware };
