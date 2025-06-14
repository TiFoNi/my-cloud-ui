"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navLinks = [
  { href: "/", label: "Головна" },
  { href: "/upload", label: "Завантажити" },
  { href: "/files", label: "Файли" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-white shadow px-4 py-3 flex justify-between items-center">
      <h1 className="text-lg font-bold">My Cloud</h1>
      <nav className="flex gap-4">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "hover:underline",
              pathname === href && "font-semibold underline"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
