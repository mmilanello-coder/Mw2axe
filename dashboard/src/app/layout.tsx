import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Geriko Dashboard",
  description: "Performance outbound in tempo reale · Axend",
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
