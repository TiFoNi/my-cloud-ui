"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/account", label: "Account" },
  { href: "/dashboard/files", label: "Files" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const path = usePathname();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "#fff",
          borderBottom: "1px solid #ccc",
          padding: "10px 0",
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          zIndex: 100,
        }}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: "8px 16px",
              border: "none",
              borderBottom:
                path === link.href ? "2px solid #000" : "2px solid transparent",
              textDecoration: "none",
              color: "#000",
              cursor: "pointer",
            }}
          >
            {link.label}
          </Link>
        ))}
      </header>

      <main
        style={{
          flex: 1,
          padding: "20px",
          background: "#f9f9f9",
        }}
      >
        {children}
      </main>
    </div>
  );
}
