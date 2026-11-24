const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const { accessTokenSecret, refreshTokenSecret, accessTokenExpires, refreshTokenExpires } = require("./config");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createAccessToken(user) {
  return jwt.sign({ sub: String(user.id) }, accessTokenSecret, { expiresIn: accessTokenExpires });
}

function createRefreshToken(user) {
  return jwt.sign({ sub: String(user.id) }, refreshTokenSecret, { expiresIn: refreshTokenExpires });
}

function getRefreshTokenExpiry(token) {
  const payload = jwt.decode(token);
  if (!payload || typeof payload.exp !== "number") {
    throw new Error("Refresh token expiry is missing.");
  }
  return new Date(payload.exp * 1000);
}

function verifyAccessToken(token) {
  return jwt.verify(token, accessTokenSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, refreshTokenSecret);
}

module.exports = {
  hashToken,
  createAccessToken,
  createRefreshToken,
  getRefreshTokenExpiry,
  verifyAccessToken,
  verifyRefreshToken,
};
