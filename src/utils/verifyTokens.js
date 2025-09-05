const JWT = require("../configs/jwt.conf");
const excepetionRaiser = require("./error-handle");
exports.accessToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return excepetionRaiser.errorHandler(
        "Unauthorized",
        "Authentication failed. Token missing",
        401
      );
    }
    const [parsedToken] = await JWT.verifyAccessToken(token);
    req.token = parsedToken;
    return next();
  } catch (error) {
    error.statusCode = 401;
    error.name = "Unauthorized";
    return excepetionRaiser.sendError(error, res);
  }
};
