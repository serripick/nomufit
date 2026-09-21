import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "노무핏",
  description: "사업장 정보를 입력하면 근로계약서·임금명세서·노무서식을 자동으로 만들어주는 노무 자동화 도구",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
