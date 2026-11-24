import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";

function GuestRoute({ children }) {
  const { loading } = useAuth();
  return loading ? <p className="varakozas" role="status">Munkamenet ellenőrzése…</p> : children;
}

export default function App() {
  return (
    <div className="kutya-cica">
      <NavBar />
      <div className="tartalom">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reg" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profil" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
