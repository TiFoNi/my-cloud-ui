import Header from "./components/Header";
import "./globals.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-main",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" className={inter.variable}>
      <head />
      <body className="bg-white text-gray-900 font-sans">
        <Header />
        <main className="p-6 max-w-screen-xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
