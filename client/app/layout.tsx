import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import AppProviders from "@/providers/AppProviders";
import NavigationProgress from "@/components/NavigationProgress";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });

const APP_NAME = "Teacher Assistant";
const DESCRIPTION =
  "Course Management Portal for teachers — plan course outlines, track student marks, compute grades and export reports.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: `${APP_NAME} - Course Management Portal`,
    template: `%s | ${APP_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: APP_NAME,
  icons: { icon: "/logo.png" },
  openGraph: {
    type: "website",
    title: `${APP_NAME} - Course Management Portal`,
    description: DESCRIPTION,
    siteName: APP_NAME,
    images: [{ url: "/logo.png", width: 512, height: 512, alt: APP_NAME }],
  },
  twitter: {
    card: "summary",
    title: `${APP_NAME} - Course Management Portal`,
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#071A2F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body>
        <NavigationProgress />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
