'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CookiesProvider } from 'react-cookie';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import Header from "../Layout/Header";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🔹 Metadata for SEO + Social Sharing
export const metadata = {
  title: "CodeURL",
  description: "Instantly share and collaborate on code via unique URLs.",
  icons: {
    icon: "/favicon.ico", // Google picks this for search
    shortcut: "/favicon.ico",
    // apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <CookiesProvider>
              <Header />
              {children}
              <Toaster richColors position="top-right" />
            </CookiesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
