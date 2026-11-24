require("dotenv").config();

const requiredVariables = [
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRES",
  "REFRESH_TOKEN_EXPIRES",
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

if (process.env.ACCESS_TOKEN_SECRET.length < 32 || process.env.REFRESH_TOKEN_SECRET.length < 32) {
  throw new Error("Token secrets must be at least 32 characters long.");
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
  },
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES,
  refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES,
  isProduction: process.env.NODE_ENV === "production",
};
