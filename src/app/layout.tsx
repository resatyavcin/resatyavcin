import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reşat Yavçin",
  description: "TOM Bank'ta yazılım geliştirici.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
