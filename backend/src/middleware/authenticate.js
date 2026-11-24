const { verifyAccessToken } = require("../auth");
const { HttpError } = require("../errors");

function authenticate(req, res, next) {
  const authorization = req.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new HttpError(401, "A folytatáshoz jelentkezz be."));
  }

  try {
    const payload = verifyAccessToken(authorization.slice(7));
    if (!payload.sub || !/^\d+$/.test(payload.sub)) {
      throw new Error("Invalid token subject.");
    }
    req.userId = payload.sub;
    return next();
  } catch {
    return next(new HttpError(401, "A munkamenet lejárt. Jelentkezz be újra."));
  }
}

module.exports = { authenticate };
