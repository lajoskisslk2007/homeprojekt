# Homeprojekt

Kis React alkalmazás Express REST API-val és MySQL-alapú felhasználókezeléssel.

## Indítás

Szükséges: Node.js 20+ és MySQL.

1. Hozz létre egy MySQL adatbázist, például `homeprojekt` néven.
2. Másold a `backend/.env.example` fájlt `backend/.env` néven, és állítsd be az adatbázis elérését, valamint két különálló, legalább 32 karakteres token titkot.
3. Telepítsd és indítsd el a backendet:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

   Induláskor az API létrehozza a szükséges `users` és `refresh_tokens` táblákat.
4. Egy másik terminálban telepítsd és indítsd el a frontendet:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

   Az alkalmazás alapértelmezés szerint a `http://localhost:5173` címen, az API pedig a `http://localhost:3000` címen érhető el. Eltérő API-címhez add meg a `frontend/.env` fájlban a `VITE_API_URL` értékét (például `http://localhost:3000/api`).

## API

| Metódus | Végpont | Sikeres státusz | Leírás |
| --- | --- | --- | --- |
| POST | `/api/auth/reg` | 201 | Regisztráció |
| POST | `/api/auth/login` | 200 | Bejelentkezés; rövid életű access tokent és HttpOnly refresh sütit ad |
| POST | `/api/auth/refresh-token` | 200 | Refresh süti cseréje és új access token kiadása |
| POST | `/api/auth/logout` | 204 | Refresh token visszavonása és süti törlése |
| GET | `/api/users/profil` | 200 | Védett profil lekérése `Authorization: Bearer <token>` fejléccel |

Hibaválaszok egységes formátuma: `{ "message": "..." }`. Az API `400`-at ad hibás bemenetre, `401`-et érvénytelen vagy hiányzó hitelesítésre, `404`-et nem létező erőforrásra/végpontra, `409`-et már használt e-mail-címre, illetve `500`-at váratlan szerverhibára. A backend csak a `FRONTEND_ORIGIN` értékében megadott origint engedi CORS-on keresztül, és engedélyezi a credential küldést.
