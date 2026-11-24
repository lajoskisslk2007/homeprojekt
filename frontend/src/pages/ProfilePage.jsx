import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/users/profil")
      .then(({ data }) => {
        if (active) setProfile(data.user);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "A profil betöltése nem sikerült.");
      });
    return () => { active = false; };
  }, []);

  return (
    <main className="adatlap">
      <p className="kis-szoveg">Személyes fiók</p>
      <h1>Szia, {profile?.name || user?.name || "…" }!</h1>
      <p className="profil-szoveg">Itt találod a fiókodhoz tartozó alapadatokat.</p>
      {error ? (
        <p className="hiba-szoveg" role="alert">{error}</p>
      ) : (
        <section className="adat-kartya" aria-label="Profiladatok">
          <div className="kor" aria-hidden="true">{(profile?.name || user?.name || "?").charAt(0).toUpperCase()}</div>
          <div><span className="kis-cim">Név</span><strong>{profile?.name || user?.name || "Betöltés…"}</strong></div>
          <div><span className="kis-cim">E-mail-cím</span><strong>{profile?.email || user?.email || "Betöltés…"}</strong></div>
        </section>
      )}
    </main>
  );
}
