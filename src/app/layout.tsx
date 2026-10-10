import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Script from "next/script";
import SiteMotion from "@/components/SiteMotion";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: "Resat Yavcin",
  description: "Resat Yavcin",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${beVietnamPro.className} ${beVietnamPro.variable} dark h-full antialiased`}
    >
      <body className="h-dvh overflow-hidden">
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{if(localStorage.getItem('theme')==='light')document.documentElement.classList.remove('dark');else document.documentElement.classList.add('dark')}catch(e){}`}
        </Script>
        <SiteMotion />
        {children}
      </body>
    </html>
  );
}
