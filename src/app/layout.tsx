import type { Metadata } from "next";
import "./globals.css";
import "./editorial-theme.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "ILLOCA — Architectural Design at the Speed of Thought",
  description:
    "illoca is an AI-native design engine built for professional architects. Explore, refine, and move from first ideas to editable 2D and 3D designs with more speed and control.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo-180.png", type: "image/png" },
    ],
    apple: "/logo-180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="lenis-active">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
