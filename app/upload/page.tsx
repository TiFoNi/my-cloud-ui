"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="max-w-xl mx-auto mt-12 p-6 border rounded">
      <h1 className="text-2xl font-bold mb-6">Upload a File</h1>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
