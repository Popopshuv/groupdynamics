import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { ClientShell } from "@/components/ClientShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "group dynamics",
    template: "%s",
  },
  description:
    "Independent design and development lab. We work off-grid, building ideas that feel discovered, not manufactured. Part studio, part workshop, part experimental unit.",
  metadataBase: new URL("https://groupdynamics.net"),
  openGraph: {
    title: "group dynamics",
    description:
      "Independent design and development lab. Part studio, part workshop, part experimental unit.",
    siteName: "group dynamics",
    type: "website",
    images: [{ url: "/og.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "group dynamics",
    description:
      "Independent design and development lab. Part studio, part workshop, part experimental unit.",
    images: ["/og.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <ClientShell>{children}</ClientShell>
        <Analytics />
      </body>
    </html>
  );
}
