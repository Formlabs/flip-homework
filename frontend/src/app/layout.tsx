import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Formlabs 3D Store",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh relative`}
      >
        {/* Futuristic background layers */}
        <div className="bg-radial" />
        <div className="bg-grid" />
        <div className="bg-aurora" />

        {/* Page content */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
