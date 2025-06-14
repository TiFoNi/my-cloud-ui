"use client";

import { useEffect, useState } from "react";

export default function AccountPage() {
  const [user, setUser] = useState<{
    email: string;
    nickname: string;
    role: string;
  } | null>(null);

  const [form, setForm] = useState({
    nickname: "",
    role: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setForm({
          nickname: data.nickname,
          role: data.role,
        });
      }
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/api/auth/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMessage("✅ Збережено успішно");
    } else {
      setMessage("❌ Не вдалося зберегти");
    }
  };

  if (!user) return <p style={{ textAlign: "center" }}>Завантаження...</p>;

  return (
    <div
      style={{
        textAlign: "left",
        maxWidth: "400px",
        margin: "0 auto",
        padding: "40px",
        color: "#000",
      }}
    >
      <h2 style={{ textAlign: "center" }}>👤 Інформація про акаунт</h2>

      <p>
        <strong>Email:</strong> {user.email}
      </p>

      <div style={{ marginTop: "20px" }}>
        <label>Нікнейм:</label>
        <input
          name="nickname"
          value={form.nickname}
          onChange={handleChange}
          style={{
            padding: "8px",
            width: "100%",
            marginBottom: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            textAlign: "center",
          }}
        />

        <label>Роль:</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          style={{
            padding: "8px",
            width: "100%",
            border: "1px solid #ccc",
            borderRadius: "4px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            width: "100%",
            borderBottom: "2px solid #000",
            background: "#f5f5f5",
            cursor: "pointer",
          }}
        >
          💾 Зберегти
        </button>

        {message && (
          <p style={{ marginTop: "10px", textAlign: "center" }}>{message}</p>
        )}
      </div>
    </div>
  );
}
