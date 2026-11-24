const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { frontendOrigin } = require("./config");
const registerAuthRoutes = require("./routes/auth");
const registerUserRoutes = require("./routes/users");
const { errorHandler } = require("./errors");

const app = express();

app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
registerAuthRoutes(app);
registerUserRoutes(app);
app.use((req, res) => res.status(404).json({ message: "A kért végpont nem található." }));
app.use(errorHandler);

module.exports = app;
