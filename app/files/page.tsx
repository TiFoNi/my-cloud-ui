"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./files.module.css";
import { useAuthStore } from "@/lib/store/auth";

interface FileItem {
  _id: string;
  filename: string;
  url: string;
  s3Key: string;
  uploadedAt: string;
  folderId?: string;
}

interface FolderItem {
  _id: string;
  name: string;
  parentId?: string | null;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  console.log(uploading);
  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const [filesRes, foldersRes] = await Promise.all([
      fetch("/api/files", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("/api/folders", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (filesRes.ok) setFiles(await filesRes.json());
    if (foldersRes.ok) setFolders(await foldersRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId", selectedFolderId);

    const res = await fetch("/api/files/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) fetchData();
    setUploading(false);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    const token = localStorage.getItem("token");

    const res = await fetch("/api/folders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newFolderName,
        parentId: selectedFolderId || null,
      }),
    });

    if (res.ok) {
      setNewFolderName("");
      fetchData();
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const confirmed = window.confirm(
      "Видалити цю папку з усіма файлами та підпапками?"
    );
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/api/folders", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ folderId }),
    });

    if (res.ok) {
      if (selectedFolderId === folderId) setSelectedFolderId("");
      fetchData();
    }
  };

  const renderFolders = (parentId: string | null = null, level = 0) => {
    return folders
      .filter((f) => f.parentId === parentId)
      .map((folder) => (
        <div key={folder._id}>
          <div
            className={`${styles.folderItem} ${
              selectedFolderId === folder._id ? styles.activeFolder : ""
            }`}
            style={{
              paddingLeft: `${0.5 + level * 1.5}rem`,
              marginTop: "2px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onClick={() => setSelectedFolderId(folder._id)}
          >
            <span>
              {level > 0 && <span style={{ marginRight: "4px" }}>↳</span>}
              📁 {folder.name}
            </span>
            <button
              className={styles.deleteFolderBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(folder._id);
              }}
            >
              ❌
            </button>
          </div>
          {renderFolders(folder._id, level + 1)}
        </div>
      ));
  };

  const filteredFiles = files.filter(
    (f) => (f.folderId ?? null) === (selectedFolderId || null)
  );

  if (loading) return <p className={styles.loading}>Loading files...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Files</h1>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Folders</h2>

          <div className={styles.folderList}>
            <div
              className={`${styles.folderItem} ${
                !selectedFolderId ? styles.activeFolder : ""
              }`}
              style={{ paddingLeft: 0.5 + "rem" }}
              onClick={() => setSelectedFolderId("")}
            >
              📁 Всі файли
            </div>
            {renderFolders()}
          </div>

          <div className={styles.newFolderForm}>
            <input
              type="text"
              className={styles.textInput}
              placeholder="New folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <button className={styles.button} onClick={createFolder}>
              + New Folder
            </button>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.fileGrid}>
            <div className={`${styles.card} ${styles.uploadCard}`}>
              <label className={styles.uploadLabel}>
                <span className={styles.plus}>＋</span>
                <input
                  type="file"
                  className={styles.fileInputHidden}
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) handleUpload(selected);
                  }}
                />
              </label>
            </div>

            {filteredFiles.map((file) => (
              <div key={file._id} className={styles.card}>
                <div className={styles.cardHeader}>{file.filename}</div>
                <div className={styles.cardBody}>
                  <p>{new Date(file.uploadedAt).toLocaleString()}</p>
                  <div className={styles.cardActions}>
                    <button
                      onClick={() => {
                        const token = localStorage.getItem("token");
                        const downloadUrl = `/api/files/download?s3Key=${encodeURIComponent(file.s3Key)}`;

                        const a = document.createElement("a");
                        a.href = downloadUrl;
                        a.download = file.filename;
                        a.target = "_blank";
                        a.rel = "noopener noreferrer";

                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      }}
                      className={styles.downloadBtn}
                    >
                      Download
                    </button>

                    <button
                      onClick={async () => {
                        const token = localStorage.getItem("token");
                        await fetch("/api/files/delete", {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ fileId: file._id }),
                        });
                        fetchData();
                      }}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}