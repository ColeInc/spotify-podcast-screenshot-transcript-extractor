import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Screenshot Transcript Extractor",
  description: "Extract transcripts from video screenshots using AI automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
