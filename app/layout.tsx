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
  title: "group dynamics",
  description: "group dynamics",
  openGraph: {
    title: "group dynamics",
    description: "group dynamics",
    images: [
      {
        url: "/images/groupd-meta.svg",
        width: 1200,
        height: 630,
        alt: "Group Dynamics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "group dynamics",
    description: "group dynamics",
    images: ["/images/groupd-meta.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
