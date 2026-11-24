const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { HttpError, asyncHandler } = require("../errors");
const {
  hashToken,
  createAccessToken,
  createRefreshToken,
  getRefreshTokenExpiry,
  verifyRefreshToken,
} = require("../auth");
const { isProduction } = require("../config");

const cookieName = "refreshToken";
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/api/auth",
};

function publicUser(user) {
  return { id: String(user.id), name: user.name, email: user.email };
}

function sendTokens(res, user, refreshToken) {
  res.cookie(cookieName, refreshToken, {
    ...cookieOptions,
    expires: getRefreshTokenExpiry(refreshToken),
  });
  return {
    accessToken: createAccessToken(user),
    user: publicUser(user),
  };
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function registerAuthRoutes(app) {
app.post("/api/auth/reg", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
    throw new HttpError(400, "A név 2 és 80 karakter közötti legyen.");
  }
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw new HttpError(400, "Adj meg egy érvényes e-mail-címet.");
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 72) {
    throw new HttpError(400, "A jelszó legalább 8, legfeljebb 72 karakter legyen.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name.trim(), normalizeEmail(email), passwordHash],
  );

  return res.status(201).json({
    user: { id: String(result.insertId), name: name.trim(), email: normalizeEmail(email) },
  });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string") {
    throw new HttpError(400, "Az e-mail-cím és a jelszó megadása kötelező.");
  }

  const [rows] = await pool.execute(
    "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
    [normalizeEmail(email)],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, "Hibás e-mail-cím vagy jelszó.");
  }

  const refreshToken = createRefreshToken(user);
  await pool.execute(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [user.id, hashToken(refreshToken), getRefreshTokenExpiry(refreshToken)],
  );
  return res.status(200).json(sendTokens(res, user, refreshToken));
}));

app.post("/api/auth/refresh-token", asyncHandler(async (req, res) => {
  const token = req.cookies[cookieName];
  if (!token) {
    throw new HttpError(401, "A munkamenet lejárt. Jelentkezz be újra.");
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, "A munkamenet lejárt. Jelentkezz be újra.");
    }
    throw error;
  }

  const connection = await pool.getConnection();
  let newRefreshToken;
  let user;
  try {
    await connection.beginTransaction();
    const [tokens] = await connection.execute(
      "SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = ? FOR UPDATE",
      [hashToken(token)],
    );
    const storedToken = tokens[0];
    if (
      !storedToken ||
      storedToken.revoked_at ||
      new Date(storedToken.expires_at).getTime() <= Date.now() ||
      String(storedToken.user_id) !== String(payload.sub)
    ) {
      throw new HttpError(401, "A munkamenet lejárt. Jelentkezz be újra.");
    }

    const [users] = await connection.execute(
      "SELECT id, name, email FROM users WHERE id = ? LIMIT 1",
      [storedToken.user_id],
    );
    user = users[0];
    if (!user) {
      throw new HttpError(401, "A felhasználó már nem érhető el.");
    }

    newRefreshToken = createRefreshToken(user);
    await connection.execute(
      "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?",
      [storedToken.id],
    );
    await connection.execute(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [user.id, hashToken(newRefreshToken), getRefreshTokenExpiry(newRefreshToken)],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return res.status(200).json(sendTokens(res, user, newRefreshToken));
}));

app.post("/api/auth/logout", asyncHandler(async (req, res) => {
  const token = req.cookies[cookieName];
  if (token) {
    await pool.execute(
      "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ? AND revoked_at IS NULL",
      [hashToken(token)],
    );
  }
  res.clearCookie(cookieName, cookieOptions);
  return res.status(204).end();
}));
}

module.exports = registerAuthRoutes;
