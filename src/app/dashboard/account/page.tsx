"use client";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const [user, setUser] = useState<{
    email: string;
    nickname: string;
    role: string;
  } | null>(null);
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("");
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
        setNickname(data.nickname);
        setRole(data.role);
      }
    });
  }, []);

  useEffect(() => {
    setMessage("");
  }, [nickname, role]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/api/auth/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nickname, role }),
    });

    if (res.ok) {
      setMessage("✅ Saved!");
    } else {
      setMessage("❌ Failed to save");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div
      style={{
        textAlign: "center",
        maxWidth: "400px",
        margin: "0 auto",
        color: "#000",
      }}
    >
      <h2>Account Info</h2>
      <p>
        <strong>Email:</strong> {user.email}
      </p>

      <div style={{ marginTop: "20px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Nickname:
        </label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          style={{
            padding: "8px",
            width: "100%",
            marginBottom: "16px",
            border: "2px solid black",
            outline: "none",
            background: "transparent",
            color: "#000",
            textAlign: "center",
          }}
        />

        <label style={{ display: "block", marginBottom: "4px" }}>Role:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            padding: "8px",
            width: "100%",
            border: "none",
            borderBottom: "2px solid black",
            outline: "none",
            background: "transparent",
            color: "#000",
            textAlign: "center",
            appearance: "none",
          }}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <br />
        <br />
        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            borderBottom: "2px solid #000",
            background: "none",
            cursor: "pointer",
          }}
        >
          Save
        </button>

        {message && <p style={{ marginTop: "10px" }}>{message}</p>}
      </div>
    </div>
  );
}
