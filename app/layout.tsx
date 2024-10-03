import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  display: 'swap',
  variable: "--font-geist-sans"
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  display: 'swap',
  variable: "--font-geist-mono"
});

export const metadata: Metadata = {
  title: "Miit Call",
  description: "Premium video meetings. Now free for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
