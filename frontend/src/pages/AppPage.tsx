import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function AppPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div>
      <h1>APP, HELOO {user?.login}</h1>
      <p>Here will be Excalidraw boards</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
