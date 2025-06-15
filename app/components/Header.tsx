"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";

const navLinks = [
  { href: "/", label: "Головна" },
  { href: "/upload", label: "Завантажити" },
  { href: "/files", label: "Файли" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <svg
            width="22"
            height="22"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              d="M12 2L2 7l10 5 10-5-10-5z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17l10 5 10-5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12l10 5 10-5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>MyCloud</span>
        </Link>

        <nav className={styles.nav}>
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <button className={styles.signIn}>Sign in</button>
          <button className={styles.signUp}>Sign up</button>
        </div>
      </div>
    </header>
  );
}
