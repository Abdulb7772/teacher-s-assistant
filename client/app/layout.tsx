import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import NavigationProgress from "@/components/NavigationProgress";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Teacher Assistant - Course Management Portal",
  description:
    "Course Management Portal for teachers — plan course outlines, track student marks, compute grades and export reports.",
  icons: { icon: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#071A2F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body>
        <NavigationProgress />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
