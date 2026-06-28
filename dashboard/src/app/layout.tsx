import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axend — Live Dashboard",
  description: "Dashboard outbound in tempo reale, powered by Instantly.ai · Axend",
  icons: { icon: "/axend-logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
