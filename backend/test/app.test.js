const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");

process.env.DB_HOST = "127.0.0.1";
process.env.DB_USER = "test";
process.env.DB_NAME = "homeprojekt_test";
process.env.ACCESS_TOKEN_SECRET = "test-access-token-secret-at-least-32-characters";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-token-secret-at-least-32-characters";
process.env.ACCESS_TOKEN_EXPIRES = "15m";
process.env.REFRESH_TOKEN_EXPIRES = "7d";
process.env.FRONTEND_ORIGIN = "http://localhost:5173";

const app = require("../src/app");
let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("CORS accepts the configured frontend origin with credentials", async () => {
  const response = await fetch(`${baseUrl}/api/unknown`, {
    headers: { Origin: "http://localhost:5173" },
  });
  assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
  assert.equal(response.headers.get("access-control-allow-credentials"), "true");
});

test("registration validation returns a consistent JSON error", async () => {
  const response = await fetch(`${baseUrl}/api/auth/reg`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "A", email: "user@example.com", password: "password123" }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: "A név 2 és 80 karakter közötti legyen." });
});

test("profile endpoint rejects requests without an access token", async () => {
  const response = await fetch(`${baseUrl}/api/users/profil`);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: "A folytatáshoz jelentkezz be." });
});
