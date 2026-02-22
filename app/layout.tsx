import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "블로그 글쓰기",
  description: "효율적인 블로그 포스팅을 위한 AI 글쓰기 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
