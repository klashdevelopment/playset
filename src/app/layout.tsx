import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Root from "./root";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Playset",
  description: "Convert setlists to playlists with ease.",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Root>
          {children}
        </Root>
      </body>
    </html>
  );
}
