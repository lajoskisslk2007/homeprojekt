import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const [logoutError, setLogoutError] = useState("");

  function handleLogout() {
    setLogoutError("");
    logout().catch((error) => {
      setLogoutError(error.response?.data?.message || "A kijelentkezés nem sikerült. Próbáld újra.");
    });
  }

  return (
    <header className="cica">
    <Link className="ez-az-amaz" to="/">Homeprojekt<span>.</span></Link>
      <nav aria-label="Fő navigáció">
        <Link to="/">Főoldal</Link>
        {user ? (
          <>
            <Link to="/profil">Profil</Link>
            <button className="kijelentkezo-gomb" type="button" onClick={handleLogout}>Kijelentkezés</button>
          </>
        ) : (
          <>
            <Link to="/reg">Regisztráció</Link>
            <Link className="belepo-gomb" to="/login">Bejelentkezés</Link>
          </>
        )}
      </nav>
      {logoutError && <span className="ajjaj" role="alert">{logoutError}</span>}
    </header>
  );
}
