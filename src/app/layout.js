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
        </CookiesProvider></AuthProvider></ThemeProvider>
      </body>
    </html>
  );
}