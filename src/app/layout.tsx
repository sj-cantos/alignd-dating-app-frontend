import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ReduxProvider } from "@/store/provider";
import { Navigation } from "@/components/Navigation";
import GridBackground from "@/components/GridBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Charmd - Find Your Perfect Match",
  description: "A modern dating app with neobrutalism design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen`}>
        <GridBackground />
        <div className="relative z-10">
          <ReduxProvider>
            <Navigation />
            {children}
            <Toaster 
              position="top-center"
              richColors
              closeButton
            />
          </ReduxProvider>
        </div>
      </body>
    </html>
  );
}
