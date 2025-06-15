"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./files.module.css";

type FileItem = {
  _id: string;
  filename: string;
  url: string;
  s3Key: string;
  uploadedAt: string;
};

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchFiles = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch("/api/files", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return console.error("Failed to fetch files");

      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const downloadFile = async (s3Key: string, filename: string) => {
    const res = await fetch(
      `/api/files/download?s3Key=${encodeURIComponent(s3Key)}`
    );
    const { url } = await res.json();
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const deleteFile = async (fileId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/files/delete", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId }),
    });

    if (res.ok) {
      setFiles(files.filter((f) => f._id !== fileId));
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  if (loading) return <p className={styles.loading}>Loading files...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Files</h1>
      {files.length === 0 ? (
        <p className={styles.empty}>No files uploaded.</p>
      ) : (
        <ul className={styles.fileList}>
          {files.map((file) => (
            <li key={file._id} className={styles.fileItem}>
              <div>
                <p className={styles.fileName}>{file.filename}</p>
                <p className={styles.uploadDate}>
                  Uploaded at: {new Date(file.uploadedAt).toLocaleString()}
                </p>
              </div>
              <div className={styles.actions}>
                <button
                  onClick={() => downloadFile(file.s3Key, file.filename)}
                  className={styles.downloadBtn}
                >
                  Download
                </button>
                <button
                  onClick={() => deleteFile(file._id)}
                  className={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
