import type { Metadata } from "next";
import { DynaPuff } from "next/font/google";
import "./globals.css";

const dynaPuff = DynaPuff({
  variable: "--font-dyna-puff",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Higher or Lower",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dynaPuff.variable} antialiased`}>{children}</body>
    </html>
  );
}
