import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  if (user) return <Navigate to="/profil" replace />;

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (form.name.trim().length < 2) {
      setError("A név legalább 2 karakter legyen.");
      return;
    }
    if (form.password.length < 8) {
      setError("A jelszó legalább 8 karakter legyen.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("A két jelszó nem egyezik.");
      return;
    }

    api.post("/auth/reg", {
        name: form.name,
        email: form.email,
        password: form.password,
      })
      .then(() => {
        navigate("/login", { replace: true, state: { message: "Sikeres regisztráció. Most már bejelentkezhetsz." } });
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.message || "A regisztráció most nem sikerült.");
      });
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <main className="form-oldal">
      <section className="kartya">
        <p className="kis-szoveg">Új fiók</p>
        <h1>Regisztráció</h1>
        <p className="bevezeto">Hozd létre a fiókodat néhány egyszerű lépésben.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Teljes név</label>
          <input id="name" name="name" autoComplete="name" minLength="2" maxLength="80" required value={form.name} onChange={updateField} />
          <label htmlFor="email">E-mail-cím</label>
          <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={updateField} />
          <label htmlFor="password">Jelszó</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength="8" maxLength="72" required value={form.password} onChange={updateField} />
          <label htmlFor="confirmPassword">Jelszó újra</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={updateField} />
          {error && <p className="hiba-szoveg" role="alert">{error}</p>}
          <button className="gombocska zold-gomb nagy-gomb" type="submit">Fiók létrehozása</button>
        </form>
        <p className="masik-link">Már van fiókod? <Link to="/login">Bejelentkezés</Link></p>
      </section>
    </main>
  );
}
