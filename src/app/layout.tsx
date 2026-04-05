import type { Metadata } from "next";
import { ClientShell } from "@/components/ClientShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Group Dynamics",
    template: "%s — Group Dynamics",
  },
  description:
    "Independent design and development lab. We work off-grid, building ideas that feel discovered, not manufactured. Part studio, part workshop, part experimental unit.",
  metadataBase: new URL("https://groupdynamics.net"),
  openGraph: {
    title: "Group Dynamics",
    description:
      "Independent design and development lab. Part studio, part workshop, part experimental unit.",
    siteName: "Group Dynamics",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Group Dynamics",
    description:
      "Independent design and development lab. Part studio, part workshop, part experimental unit.",
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
      </body>
    </html>
  );
}
