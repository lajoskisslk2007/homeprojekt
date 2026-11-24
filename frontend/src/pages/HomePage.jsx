import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  return (
    <main className="nagy-doboz">
      <p className="kis-szoveg">Üdvözlünk a Homeprojektben</p>
      <h1>Tervezd meg<br /><span>a következő lépést.</span></h1>
      <p className="szoveg-doboz">
        Egy egyszerű, biztonságos kiindulópont az otthoni projektjeid és ötleteid számára.
      </p>
      <Link className="gombocska zold-gomb" to={user ? "/profil" : "/reg"}>
        {user ? "Ugrás a profilodra" : "Kezdjük el"}
      </Link>
      <div className="megjegyzes"><span className="potty" /> A fiókod adatai biztonságban vannak</div>
    </main>
  );
}
