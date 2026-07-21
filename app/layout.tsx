import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "다듬 — AI 티 없이, 사람이 쓴 것처럼",
  description:
    "AI로 쓴 한국어 글의 번역투와 어색한 문체를 자연스러운 한국어로 다듬어 드립니다. 내용은 그대로, 문체만 사람답게.",
  openGraph: {
    title: "다듬 (Dadeum) — 자연스러운 한국어 윤문",
    description:
      "AI로 쓴 한국어 글을 사람이 쓴 것처럼 매끄럽게. 번역투 제거, 자연스러운 문체.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
