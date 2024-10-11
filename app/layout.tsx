import "./globals.css";
import type { Metadata } from "next";
import { geistMono, geistSans } from "@/lib/fonts/fonts";

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
