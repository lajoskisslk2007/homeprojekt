const app = require("./app");
const { port } = require("./config");
const { pool, initializeDatabase } = require("./db");

async function start() {
  await initializeDatabase();
  app.listen(port, () => {
    console.log(`Homeprojekt API elérhető: http://localhost:${port}`);
  });
}

start().catch(async (error) => {
  console.error("Az API indítása sikertelen:", error);
  await pool.end();
  process.exitCode = 1;
});
