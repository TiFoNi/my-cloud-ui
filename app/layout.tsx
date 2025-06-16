import Header from "./components/Header";
import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-gray-900 font-sans">
        <Header />
        <main className="p-6 max-w-screen-xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
