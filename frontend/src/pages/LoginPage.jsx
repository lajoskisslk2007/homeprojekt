import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/profil" replace />;

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    login({ email, password })
      .then(() => navigate("/profil", { replace: true }))
      .catch(() => setError("Nem sikerült belépni. Ellenőrizd az adataidat."));
  }

  return (
    <main className="form-oldal">
      <section className="kartya">
        <p className="kis-szoveg">Üdv újra</p>
        <h1>Bejelentkezés</h1>
        <p className="bevezeto">Jelentkezz be, hogy folytathasd a projektjeidet.</p>
        {location.state?.message && <p className="jo-uzi" role="status">{location.state.message}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail-cím</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="password">Jelszó</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="hiba-szoveg" role="alert">{error}</p>}
          <button className="gombocska zold-gomb nagy-gomb" type="submit">Bejelentkezés</button>
        </form>
        <p className="masik-link">Nincs fiókod? <Link to="/reg">Regisztráció</Link></p>
      </section>
    </main>
  );
}
