import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../api/users";
import styles from "./styles/AdminPage.module.css";
import { Loader } from "../components/Loader";
import type { User } from "../api/types";

export function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // редактирование
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editLogin, setEditLogin] = useState("");
  const [editPassword, setEditPassword] = useState("");

  // создание
  const [creatingUser, setCreatingUser] = useState(false);
  const [newLogin, setNewLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10);

    listUsers()
      .then((res) => setUsers(res || []))
      .finally(() => setLoading(false));

    return () => clearTimeout(timeout);
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  async function handleSave(userId?: number) {
    try {
      if (userId != null) {
        if (!editLogin.trim()) return;
        await updateUser(userId, {
          login: editLogin,
          password: editPassword || undefined,
        });
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, login: editLogin } : u
          )
        );
        setEditingUserId(null);
        setEditLogin("");
        setEditPassword("");
      } else {
        if (!newLogin.trim()) return;
        const created = await createUser(newLogin, newPassword);
        setUsers((prev) => [...prev, created]);
        setCreatingUser(false);
        setNewLogin("");
        setNewPassword("");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving user");
    }
  }

  async function handleDelete(userId: number) {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
      alert("Error deleting user");
    }
  }

  return (
    <div
      className={`${styles.pageContainer} ${
        visible ? styles.pageContainerVisible : ""
      }`}
    >
      {loading && <Loader />}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userPanel}>
          <span className={styles.loggedText}>{user?.login} (admin)</span>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className={styles.boardsGrid}>
        {users.map((u) => (
          <div key={u.id} className={styles.boardCard}>
            {editingUserId === u.id ? (
              <div className={styles.createForm}>
                <input
                  autoFocus
                  className={styles.input}
                  value={editLogin}
                  onChange={(e) => setEditLogin(e.target.value)}
                  placeholder="login"
                />
                <input
                  className={styles.input}
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="password"
                />
                <div className={styles.createButtons}>
                  <button
                    className={styles.circleButton}
                    onClick={() => handleSave(u.id)}
                  >
                    ✓
                  </button>
                  <button
                    className={styles.circleButton}
                    onClick={() => {
                      setEditingUserId(null);
                      setEditLogin("");
                      setEditPassword("");
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.boardCardContent}>
                <span className={styles.boardName}>{u.login}</span>
                <div className={styles.createButtons}>
                  <button
                    className={styles.circleButton}
                    onClick={() => {
                      setEditingUserId(u.id);
                      setEditLogin(u.login);
                      setEditPassword("");
                      setCreatingUser(false);
                    }}
                  >
                    ✎
                  </button>
                  <button
                    className={styles.circleButton}
                    onClick={() => handleDelete(u.id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add user */}
        <div
          className={`${styles.addCard} ${
            creatingUser ? styles.addCardActive : ""
          }`}
          onClick={() => !creatingUser && setCreatingUser(true)}
        >
          <div
            className={`${styles.addContent} ${
              creatingUser ? styles.addHidden : ""
            }`}
          >
            <div className={styles.addText}>+ new user</div>
          </div>

          <div
            className={`${styles.addContent} ${
              !creatingUser ? styles.addHidden : ""
            }`}
          >
            <div className={styles.createForm}>
              <input
                autoFocus
                value={newLogin}
                onChange={(e) => setNewLogin(e.target.value)}
                placeholder="login"
                className={styles.input}
              />
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                placeholder="password"
                className={styles.input}
              />
              <div className={styles.createButtons}>
                <button
                  onClick={() => handleSave()}
                  className={styles.circleButton}
                >
                  ✓
                </button>
                <button
                  onClick={() => setCreatingUser(false)}
                  className={styles.circleButton}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
