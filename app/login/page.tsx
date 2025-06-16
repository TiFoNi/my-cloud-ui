"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./login.module.css";
import { useAuthStore } from "@/lib/store/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      login();
      router.push("/files");
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleLogin}>
      <h2 className={styles.title}>Login</h2>
      <input
        className={styles.input}
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className={styles.input}
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button className={styles.button} type="submit">
        Login
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
