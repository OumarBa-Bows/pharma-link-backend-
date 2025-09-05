const jwt = require("jsonwebtoken");

module.exports = {
  issueAccessToken: (payload) =>
    _issueToken({
      payload,
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    }),
  issueRefreshToken: (payload) =>
    _issueToken({
      payload,
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    }),
  verifyAccessToken: (token) =>
    _verifyToken({ token, secret: process.env.JWT_SECRET_KEY }),
  verifyRefreshToken: (token) =>
    _verifyToken({ token, secret: process.env.JWT_SECRET_KEY }),
};

async function _issueToken({ payload, secret, expiresIn }) {
  try {
    const token = jwt.sign(payload, secret, { expiresIn });
    return Promise.resolve(token);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function _verifyToken({ token, secret }) {
  try {
    const parsedToken = await jwt.verify(token, secret, {});
    return Promise.resolve([parsedToken]);
  } catch (error) {
    return Promise.reject(error);
  }
}
