"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./upload.module.css";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return alert("Unauthorized");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      router.push("/files");
    } else {
      alert("Upload failed");
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Upload a File</h1>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className={styles.input}
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={styles.button}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
