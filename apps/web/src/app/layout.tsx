import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
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
  title: {
    default: "CodeForge AI",
    template: "%s | CodeForge AI",
  },
  description:
    "AI-powered Developer Productivity Platform — Build faster, smarter, together.",
  keywords: ["AI", "developer tools", "coding assistant", "SaaS", "productivity"],
  authors: [{ name: "CodeForge AI Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "CodeForge AI",
    description: "AI-powered Developer Productivity Platform",
    siteName: "CodeForge AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeForge AI",
    description: "AI-powered Developer Productivity Platform",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast: "glass",
                },
              }}
            />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
