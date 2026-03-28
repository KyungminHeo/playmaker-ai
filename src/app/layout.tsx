/**
 * RootLayout — 전체 앱의 루트 레이아웃
 *
 * 모든 페이지에 공통 적용되는 HTML 구조.
 * 메타데이터와 전역 CSS를 여기서 관리.
 */
import type { Metadata } from "next";
import "./globals.css";

// 페이지 메타데이터 — 브라우저 탭 제목, SEO
export const metadata: Metadata = {
  title: "PlayMaker AI — 플레이어블 광고 자동 생성기",
  description: "게임 스크린샷으로 10분 만에 플레이어블 광고를 생성하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* antialiased: 폰트 부드럽게 렌더링 */}
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
