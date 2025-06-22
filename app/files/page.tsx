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
  const [ownFiles, setOwnFiles] = useState<FileItem[]>([]);
  const [deptFiles, setDeptFiles] = useState<FileItem[]>([]);
  const [ownFolders, setOwnFolders] = useState<FolderItem[]>([]);
  const [deptFolders, setDeptFolders] = useState<FolderItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const { isLoggedIn } = useAuthStore();

  console.log(uploading);

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const [filesRes, foldersRes] = await Promise.all([
      fetch("/api/files", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/folders", { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (filesRes.ok) {
      const filesData = await filesRes.json();
      setOwnFiles(filesData.ownFiles || []);
      setDeptFiles(filesData.deptFiles || []);
    }
    if (foldersRes.ok) {
      const folderData = await foldersRes.json();
      setOwnFolders(folderData.ownFolders || []);
      setDeptFolders(folderData.deptFolders || []);
      setFolders([
        ...(folderData.ownFolders || []),
        ...(folderData.deptFolders || []),
      ]);
    }

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
            className={`${styles.folderItem} ${selectedFolderId === folder._id ? styles.activeFolder : ""}`}
            style={{
              paddingLeft: `${0.5 + level * 1.5}rem`,
              marginTop: "2px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onClick={() => setSelectedFolderId(folder._id)}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                overflow: "hidden",
              }}
            >
              {level > 0 && <span>↳</span>}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.folderIcon}
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
              </svg>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {folder.name}
              </span>
            </span>
            {ownFolders.some((own) => own._id === folder._id) && (
              <button
                className={styles.deleteFolderBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder._id);
                }}
                aria-label="Delete folder"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          {renderFolders(folder._id, level + 1)}
        </div>
      ));
  };

  const filteredOwnFiles = ownFiles.filter(
    (f) => (f.folderId ?? null) === (selectedFolderId || null)
  );
  const filteredDeptFiles = deptFiles.filter(
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
              style={{
                paddingLeft: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onClick={() => setSelectedFolderId("")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.folderIcon}
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
              </svg>{" "}
              Default Folder
            </div>
            {renderFolders()}
          </div>
          <div className={styles.newFolderForm}>
            <div className={styles.newFolderActions}>
              <input
                type="text"
                className={styles.textInput}
                placeholder="New folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <button
                className={styles.button}
                onClick={createFolder}
                aria-label="Створити папку"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.fileGrid}>
            {filteredOwnFiles.length === 0 && (
              <>
                <h3 className={styles.sectionTitle}>Ваші файли</h3>
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
              </>
            )}
            {filteredOwnFiles.length > 0 && (
              <>
                <h3 className={styles.sectionTitle}>Ваші файли</h3>
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
                {filteredOwnFiles.map((file) => (
                  <div key={file._id} className={styles.card}>
                    <div className={styles.cardHeader}>{file.filename}</div>
                    <div className={styles.cardBody}>
                      <p>{new Date(file.uploadedAt).toLocaleString()}</p>
                      <div className={styles.cardActions}>
                        <button
                          onClick={async () => {
                            const token = localStorage.getItem("token");
                            if (!token) return alert("Not authenticated");

                            const url = `/api/files/download?s3Key=${encodeURIComponent(
                              file.s3Key
                            )}&token=${token}`;

                            const a = document.createElement("a");
                            a.href = url;
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
              </>
            )}

            {filteredDeptFiles.length > 0 && (
              <>
                <h3 className={styles.sectionTitle}>Файли з вашого відділу</h3>
                {filteredDeptFiles.map((file) => (
                  <div key={file._id} className={styles.card}>
                    <div className={styles.cardHeader}>{file.filename}</div>
                    <div className={styles.cardBody}>
                      <p>{new Date(file.uploadedAt).toLocaleString()}</p>
                      <div className={styles.cardActions}>
                        <button
                          onClick={async () => {
                            const token = localStorage.getItem("token");
                            if (!token) return alert("Not authenticated");

                            const url = `/api/files/download?s3Key=${encodeURIComponent(
                              file.s3Key
                            )}&token=${token}`;

                            const a = document.createElement("a");
                            a.href = url;
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
                          style={{ visibility: "hidden" }}
                          className={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
