import { logout } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>User management will be here</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
