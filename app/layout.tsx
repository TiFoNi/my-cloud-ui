import Header from "./components/Header";
import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <Header />
        <main className="p-4 max-w-4xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
