import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { AccentProvider } from "@/components/AccentProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import { headers } from "next/headers";
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
  title: "pErC LMS SMK Perguruan Cikini Jakarta",
  description: "Platform Pembelajaran Digital SMK Perguruan Cikini Jakarta",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-[#F4F7FE] dark:bg-black text-slate-900 dark:text-slate-100 min-h-screen font-sans transition-colors duration-300`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
            <AccentProvider>
              <LayoutWrapper isMobile={isMobile}>
                {children}
              </LayoutWrapper>
            </AccentProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
