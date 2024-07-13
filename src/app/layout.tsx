"use static";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
6;
import "../../firebase/firebase.js";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plantify",
  description: "Gotta plant 'em all!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="localhostTheme">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
