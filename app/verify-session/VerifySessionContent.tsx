"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth";

export default function VerifySessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuthStore();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    fetch(`/api/sessions/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          localStorage.setItem("token", data.token);
          login();
          setStatus("success");
          setTimeout(() => router.push("/files"), 1500);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [searchParams, router, login]);

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      {status === "verifying" && <p>Verifying your session...</p>}
      {status === "success" && <p>✅ Session verified! Redirecting...</p>}
      {status === "error" && (
        <p>❌ Verification failed. Try logging in again.</p>
      )}
    </div>
  );
}
