import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyMate — Read with more clarity",
  description: "A quieter way to turn difficult reading into study material.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
