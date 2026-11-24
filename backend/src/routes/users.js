const { pool } = require("../db");
const { asyncHandler, HttpError } = require("../errors");
const { authenticate } = require("../middleware/authenticate");

function registerUserRoutes(app) {
app.get("/api/users/profil", authenticate, asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1",
    [req.userId],
  );
  const user = rows[0];
  if (!user) {
    throw new HttpError(404, "A felhasználó nem található.");
  }
  return res.status(200).json({
    user: {
      id: String(user.id),
      name: user.name,
      email: user.email,
      createdAt: user.created_at,
    },
  });
}));
}

module.exports = registerUserRoutes;
