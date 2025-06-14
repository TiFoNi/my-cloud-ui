"use client";

import { useEffect, useState } from "react";

type FileEntry = {
  _id: string;
  filename: string;
  s3Key: string;
  uploadedAt: string;
};

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/files", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setFiles(data);
  };

  const uploadFile = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    await fetch("/api/files/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    setFile(null);
    await fetchFiles();
    setLoading(false);
  };

  const downloadFile = async (s3Key: string, filename: string) => {
    const link = document.createElement("a");
    link.href = `/api/files/proxy-download?s3Key=${encodeURIComponent(
      s3Key
    )}&filename=${encodeURIComponent(filename)}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteFile = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/files/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fileId: id }),
    });
    await fetchFiles();
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: 600,
        margin: "0 auto",
        color: "black",
      }}
    >
      <h2>📁 Мої файли</h2>

      <div style={{ marginBottom: 30 }}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={uploadFile}
          disabled={!file || loading}
          style={{ marginLeft: 10 }}
        >
          Завантажити
        </button>
      </div>

      {files.map((file) => (
        <div
          key={file._id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 12,
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>{file.filename}</strong>
            <div style={{ fontSize: 12, color: "#666" }}>
              {new Date(file.uploadedAt).toLocaleString()}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => downloadFile(file.s3Key, file.filename)}>
              ⬇️
            </button>
            <button onClick={() => deleteFile(file._id)}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
}
