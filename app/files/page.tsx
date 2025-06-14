"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const res = await fetch("/api/files", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return console.error("Failed to fetch files");

    const data = await res.json();
    setFiles(data);
    setLoading(false);
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

  if (loading) return <p>Loading files...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6">Your Files</h1>
      {files.length === 0 ? (
        <p>No files uploaded.</p>
      ) : (
        <ul className="space-y-4">
          {files.map((file) => (
            <li
              key={file._id}
              className="flex items-center justify-between border p-3 rounded"
            >
              <div>
                <p className="font-medium">{file.filename}</p>
                <p className="text-sm text-gray-500">
                  Uploaded at: {new Date(file.uploadedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => downloadFile(file.s3Key, file.filename)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Download
                </button>
                <button
                  onClick={() => deleteFile(file._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
