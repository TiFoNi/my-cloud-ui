"use client";

import { useEffect, useState } from "react";
import DepartmentSelector from "../components/DepartmentSelector";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const [user, setUser] = useState<{
    email: string;
    role: string;
    department?: {
      _id: string;
      name: string;
    } | null;
  } | null>(null);
  const [newDepartment, setNewDepartment] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) =>
        setUser({
          email: data.email,
          role: data.role,
          department: data.department,
        })
      )
      .catch(() => setUser(null));
  }, []);

  const handleCreateDepartment = async () => {
    if (!newDepartment.trim()) return;

    setCreating(true);
    const res = await fetch("/api/departments", {
      method: "POST",
      body: JSON.stringify({ email: user!.email, name: newDepartment }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setMessage("✅ Відділ створено!");
      setNewDepartment("");
    } else {
      setMessage("❌ Помилка при створенні.");
    }

    setCreating(false);
    setTimeout(() => setMessage(""), 3000);
  };

  if (!user) return <div className="p-4">Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div>
          <h1 className={styles.title}>Профіль користувача</h1>
          <p className={styles.email}>Email: {user.email}</p>
        </div>

        {user.role === "admin" && (
          <div>
            <h2 className={styles.label}>Створити новий відділ</h2>
            <div className={styles.inputGroup}>
              <input
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className={styles.input}
                placeholder="Назва відділу"
              />
              <button
                disabled={creating}
                onClick={handleCreateDepartment}
                className={styles.createBtn}
              >
                Створити
              </button>
            </div>
            {message && <p className={styles.message}>{message}</p>}
          </div>
        )}

        <div>
          <h2 className={styles.label}>Виберіть відділ:</h2>
          <DepartmentSelector
            userEmail={user.email}
            selectedDepartmentId={user.department?._id}
          />
        </div>
      </div>
    </div>
  );
}
